'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BATTERY_LEVELS, type IntroPose, type IntroQuestion as Question } from '@/data/intro';
import { cn } from '@/lib/cn';
import { withBirdName, type IntroAnswer } from '@/lib/intro';
import { IntroSky } from './IntroSky';
import styles from './intro.module.css';
import { clamp, ease, lerp, prefersReducedMotion, seg, useScrollFrame } from './motion';
import { Pose } from './Pose';

type Props = {
  question: Question;
  /** 지은 새 이름 (문구의 {name} 자리에 넣는다) */
  name: string;
  index: number;
  total: number;
  onAnswer: (answer: IntroAnswer) => void;
};

function Choice({
  picked,
  className,
  onClick,
  children,
}: {
  picked: boolean;
  className?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" aria-pressed={picked} onClick={onClick} className={cn(styles.opt, className)}>
      {children}
    </button>
  );
}

/** 3. 질문 카드 하나: 오목이가 날아와 앉고 카드가 펼쳐진다. 답하면 오목이가 한마디 한다 */
export function IntroQuestion({ question, name, index, total, onAnswer }: Props) {
  const section = useRef<HTMLElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const bird = useRef<HTMLImageElement>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [battery, setBattery] = useState<number | null>(null);
  const [reaction, setReaction] = useState<string | null>(null);
  const [pose, setPose] = useState<IntroPose>('carry');
  const poseTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(poseTimer.current), []);

  useScrollFrame(() => {
    const el = section.current;
    if (!el || !head.current || !card.current || !bird.current) return;
    const H = window.innerHeight;
    const t = prefersReducedMotion() ? 1 : clamp((H - el.getBoundingClientRect().top) / (H * 0.9));
    const side = index % 2 ? -1 : 1;
    const b = ease(seg(t, 0.1, 0.55));
    const c = ease(seg(t, 0.45, 0.85));
    bird.current.style.transform = `translate(${lerp(side * 260, 0, b)}px, ${lerp(-180, 0, b) - Math.sin(b * Math.PI) * 30}px) rotate(${lerp(side * -14, 0, b)}deg) scale(${lerp(0.7, 1, b)})`;
    bird.current.style.opacity = String(seg(t, 0.08, 0.2));
    card.current.style.opacity = String(c);
    card.current.style.transform = `perspective(900px) rotateX(${lerp(-60, 0, c)}deg) translateY(${lerp(30, 0, c)}px)`;
    head.current.style.opacity = String(seg(t, 0.3, 0.7));
  });

  function react(text: string, next: IntroPose) {
    setReaction(text);
    setPose(next);
    clearTimeout(poseTimer.current);
    poseTimer.current = setTimeout(() => setPose('carry'), 1600);
  }

  function choose(k: number, answer: IntroAnswer, text: string) {
    setPicked(k);
    react(withBirdName(text, name), answer.w >= 2 ? 'heart' : 'smile');
    onAnswer(answer);
  }

  let body: ReactNode = null;
  switch (question.kind) {
    case 'pics':
      body = (
        <div className={cn(styles.opts, styles.two)}>
          {question.options.map((o, k) => (
            <Choice key={k} picked={picked === k} className={styles.pic} onClick={() => choose(k, { w: o.w }, o.reaction)}>
              <Pose pose={o.pose} />
              <span>{o.label}</span>
            </Choice>
          ))}
        </div>
      );
      break;
    case 'list':
      body = (
        <div className={styles.opts}>
          {question.options.map((o, k) => (
            <Choice key={k} picked={picked === k} onClick={() => choose(k, { w: o.w }, o.reaction)}>
              <span className={styles.em} aria-hidden>
                {o.emoji}
              </span>
              {o.label}
            </Choice>
          ))}
        </div>
      );
      break;
    case 'sky':
      body = (
        <div className={cn(styles.opts, styles.two)}>
          {question.options.map((o, k) => (
            <Choice key={k} picked={picked === k} className={styles.sky} onClick={() => choose(k, { w: o.w }, o.reaction)}>
              <IntroSky kind={o.sky} />
              <span>{o.label}</span>
            </Choice>
          ))}
        </div>
      );
      break;
    case 'chat':
      body = (
        <>
          <div className={styles.chat}>
            <p className={styles.chatName}>{question.from.name}</p>
            <div className={styles.chatFrom}>
              <span className={styles.avatar} aria-hidden>
                {question.from.name.slice(-2)}
              </span>
              <span className={styles.msg}>{question.from.message}</span>
            </div>
          </div>
          <div className={cn(styles.opts, styles.reply)}>
            {question.options.map((o, k) => (
              <Choice key={k} picked={picked === k} onClick={() => choose(k, { w: o.w, flag: o.flag }, o.reaction)}>
                {o.label}
              </Choice>
            ))}
          </div>
        </>
      );
      break;
    case 'battery': {
      const level = BATTERY_LEVELS.find((l) => l.n === battery);
      body = (
        <>
          <div className={styles.battery}>
            <div className={styles.battBody} role="group" aria-label="마음 배터리">
              {BATTERY_LEVELS.map(({ n }) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`5칸 중 ${n}칸`}
                  aria-pressed={battery !== null && n <= battery}
                  onClick={() => setBattery(n)}
                  className={cn(styles.cell, battery !== null && n <= battery && (battery === 1 ? styles.low : styles.fill))}
                />
              ))}
            </div>
            <span className={styles.battCap} />
          </div>
          <p className={styles.battLabel}>{level ? level.label : '몇 칸 남았는지 눌러줘'}</p>
          <button
            type="button"
            className={styles.primary}
            disabled={!level}
            onClick={() => {
              if (!level) return;
              react(level.reaction, level.n <= 2 ? 'heart' : 'smile');
              onAnswer({ w: level.w, battery: level.n });
            }}
          >
            이만큼 남았어
          </button>
        </>
      );
      break;
    }
    case 'topics':
      body = (
        <div className={cn(styles.opts, styles.two)}>
          {question.options.map((o, k) => (
            <Choice
              key={k}
              picked={picked === k}
              className={styles.topic}
              onClick={() => {
                setPicked(k);
                react('알려줘서 고마워. 이제 편지함에 다녀올게!', 'wings');
                onAnswer({ w: 0, topic: o.id });
              }}
            >
              <b>
                <span className={styles.em} aria-hidden>
                  {o.emoji}
                </span>
                {o.label}
              </b>
              <small>{o.example}</small>
            </Choice>
          ))}
        </div>
      );
      break;
  }

  return (
    <section ref={section} data-intro-section={question.id} className={styles.q} aria-label={`질문 ${index + 1}`}>
      <div ref={head} className={styles.qHead}>
        <p className={styles.qCount}>
          질문 {index + 1} / {total}
        </p>
        <p className={styles.qLead}>{withBirdName(question.lead, name)}</p>
      </div>
      <div className={styles.qWrap}>
        <Pose ref={bird} pose={pose} className={styles.qBird} />
        <div ref={card} className={styles.qCard}>
          <h2 className={styles.qTitle}>{withBirdName(question.title, name)}</h2>
          {question.sub ? <p className={styles.qSub}>{question.sub}</p> : <div className={styles.qGap} />}
          {body}
        </div>
      </div>
      <div className={cn(styles.reaction, reaction && styles.on)} aria-live="polite">
        <span className={styles.hand}>{reaction}</span>
      </div>
    </section>
  );
}
