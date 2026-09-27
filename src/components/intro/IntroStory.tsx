'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { INTRO_QUESTIONS, INTRO_TOPICS } from '@/data/intro';
import lettersData from '@/data/letters.json';
import { cn } from '@/lib/cn';
import { classifyIntro, introLetterFor, type IntroAnswer } from '@/lib/intro';
import type { Letter } from '@/lib/letters';
import { DEFAULT_BIRD_NAME } from '@/lib/storage/adapters';
import { useIsPersistent, useOngi, useStore } from '@/lib/storage/useOngi';
import { IntroEgg } from './IntroEgg';
import { IntroHero } from './IntroHero';
import { IntroLetter } from './IntroLetter';
import { IntroMeet } from './IntroMeet';
import { IntroQuestion } from './IntroQuestion';
import { IntroSearch } from './IntroSearch';
import styles from './intro.module.css';
import { clamp, prefersReducedMotion, useScrollFrame } from './motion';

const LETTERS = lettersData as Letter[];
/** 아직 열리지 않은 장면의 대략적인 길이 (화면 수): 편지함 뒤지기(300vh)와 편지, 알 */
const SEARCH_AND_LETTER_SCREENS = 4.5;
const EGG_SCREENS = 1;

/**
 * 처음 방문 시작 화면 "먼저 도착한 편지" (팀 시안을 옮긴 것). 카카오 로그인·이름 짓기 다음에 보여준다.
 * 편지 도착 → 지은 이름으로 인사 → 질문 6개 → 닮은 온기레터 → 가방에 담기 → 앱으로
 */
export function IntroStory() {
  const store = useStore();
  const persistent = useIsPersistent();
  const name = useOngi((s) => s.profile.birdName) ?? DEFAULT_BIRD_NAME;
  const [answers, setAnswers] = useState<Record<string, IntroAnswer>>({});
  /** 열린 질문 수 (답하면 다음 질문이 열린다) */
  const [shown, setShown] = useState(1);
  const [done, setDone] = useState(false);
  /** 가방에 담은 편지 (담은 뒤 고민 주제를 바꾸면 새 편지는 아직 담기 전) */
  const [baggedId, setBaggedId] = useState<number | null>(null);
  /** 처음부터 다시 보기: 질문 카드를 새로 그린다 */
  const [round, setRound] = useState(0);
  const { toast, showToast } = useToast(2600);
  const root = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const bar = useRef<HTMLSpanElement>(null);
  const dots = useRef<HTMLDivElement>(null);
  useEffect(() => () => clearTimeout(scrollTimer.current), []);

  const result = useMemo(() => (done ? classifyIntro(answers) : null), [done, answers]);
  const letter = useMemo(() => (result ? introLetterFor(result.topic, LETTERS) : null), [result]);
  const answered = Object.keys(answers).length;

  useScrollFrame(() => {
    const H = window.innerHeight;
    // 질문·편지가 열리며 문서가 길어져도 막대가 뒤로 가지 않게, 아직 열리지 않은 장면 길이도 전체에 넣는다
    const unopened = INTRO_QUESTIONS.length - shown + (done ? 0 : SEARCH_AND_LETTER_SCREENS) + (baggedId === null ? EGG_SCREENS : 0);
    const max = document.documentElement.scrollHeight + unopened * H - H;
    if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? clamp(window.scrollY / max) : 0})`;
    const first = sectionOf(INTRO_QUESTIONS[0].id);
    dots.current?.classList.toggle(styles.on, !!first && first.getBoundingClientRect().top < window.innerHeight * 0.6);
  });

  function sectionOf(key: string) {
    return root.current?.querySelector<HTMLElement>(`[data-intro-section="${key}"]`);
  }

  /** 답을 보고 오목이가 한마디 한 뒤 다음 장면으로 내려간다. 먼저 예약된 이동은 취소한다 (빨리 연달아 답하면 지나온 질문으로 끌려 올라가지 않게) */
  function scrollLater(key: string, delay = 1300) {
    const reduce = prefersReducedMotion();
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(
      () =>
        sectionOf(key)?.scrollIntoView({
          behavior: reduce ? 'auto' : 'smooth',
          block: 'start',
        }),
      reduce ? 300 : delay,
    );
  }

  function answer(index: number, value: IntroAnswer) {
    setAnswers((prev) => ({ ...prev, [INTRO_QUESTIONS[index].id]: value }));
    if (index === INTRO_QUESTIONS.length - 1) {
      setDone(true);
      scrollLater('search');
    } else {
      setShown((n) => Math.max(n, index + 2));
      scrollLater(INTRO_QUESTIONS[index + 1].id);
    }
  }

  function bag() {
    if (!letter) return;
    store.saveLetter(letter.id);
    setBaggedId(letter.id);
    showToast(`📮 첫 번째 편지를 ${name} 가방에 담았어요.`);
    scrollLater('egg', 1100);
  }

  function start() {
    window.scrollTo(0, 0);
    store.completeIntro();
  }

  function restart() {
    clearTimeout(scrollTimer.current);
    setAnswers({});
    setShown(1);
    setDone(false);
    setBaggedId(null);
    setRound((n) => n + 1);
    window.scrollTo(0, 0);
  }

  const topicLabel = INTRO_TOPICS.find((t) => t.id === result?.topic)?.label ?? '';

  return (
    <div ref={root} className={styles.root}>
      <div className={styles.scrollbar} aria-hidden>
        <span ref={bar} />
      </div>
      <header className={styles.top}>
        <div className={styles.logo}>
          온기<sup>°</sup>
        </div>
        <div ref={dots} className={styles.bagdots} role="img" aria-label={`모은 질문 ${answered}개 / ${INTRO_QUESTIONS.length}개`}>
          {INTRO_QUESTIONS.map((q, k) => (
            <i key={q.id} className={cn(k < answered && styles.done)} />
          ))}
        </div>
        {persistent === false && <p className={styles.notice}>이 브라우저에서는 기록이 저장되지 않아요. 창을 닫으면 사라져요.</p>}
      </header>

      <IntroHero name={name} />
      <IntroMeet name={name} />

      <main key={round}>
        {INTRO_QUESTIONS.slice(0, shown).map((question, i) => (
          <IntroQuestion
            key={question.id}
            question={question}
            name={name}
            index={i}
            total={INTRO_QUESTIONS.length}
            onAnswer={(value) => answer(i, value)}
          />
        ))}
      </main>

      {result && letter && (
        <>
          <IntroSearch key={`search-${round}`} name={name} topicLabel={topicLabel} />
          <IntroLetter
            key={`letter-${round}-${letter.id}`}
            name={name}
            result={result}
            letter={letter}
            bagged={baggedId === letter.id}
            onBag={bag}
          />
        </>
      )}
      {result && baggedId !== null && <IntroEgg name={name} result={result} onStart={start} onRestart={restart} />}

      <p className={styles.foot}>
        편지는 온기레터에 공개된 실제 고민과 답장이에요. {name}의 질문은 진단이 아니라, 닮은 편지를 찾기 위한 거예요.
      </p>
      {toast && (
        <div role="status" className={styles.toast}>
          {toast}
        </div>
      )}
    </div>
  );
}
