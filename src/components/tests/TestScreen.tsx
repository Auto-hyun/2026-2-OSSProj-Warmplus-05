'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState, type ReactNode } from 'react';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { getTest, getTestResult, type PsychTest, type TestResult } from '@/data/tests';
import { FAMILY_FRIEND } from '@/components/ui/FriendAvatar';
import { cn } from '@/lib/cn';
import { resultFor } from '@/lib/tests';
import { useStore } from '@/lib/storage/useApp';

/** 시안의 베이지 (보조 버튼·칩·진행 막대 바탕) */
const BEIGE = 'bg-[#f3ebdd]';

const primary =
  'flex h-[52px] w-full items-center justify-center rounded-2xl bg-leaf-600 text-base font-bold text-white transition-transform active:scale-[0.98] disabled:bg-line disabled:text-ink-400 disabled:active:scale-100';
const secondary = `flex h-11 w-full items-center justify-center rounded-2xl ${BEIGE} text-[15px] font-semibold text-cocoa-900 active:brightness-95`;

/** 심리테스트 (Figma): 시작 → 문항 → 결과. 주소에 ?result=가 있으면 그 결과를 바로 보여 준다 (마이페이지에서 다시 보기) */
export function TestScreen({ testId }: { testId: string }) {
  const test = getTest(testId)!;
  const resultId = useSearchParams().get('result');
  const result = resultId ? getTestResult(test, resultId) : undefined;

  return result ? <ResultView test={test} result={result} /> : <Runner key={resultId ?? 'new'} test={test} />;
}

/** 상단 바: 왼쪽 뒤로, 가운데 제목 */
function TestHeader({ title, back }: { title: string; back: string | (() => void) }) {
  const className = 'grid size-11 place-items-center rounded-full text-cocoa-900 active:bg-black/5';
  const icon = <ArrowLeftIcon size={24} aria-hidden />;
  return (
    <header className="sticky top-0 z-30 bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="grid h-14 grid-cols-[44px_1fr_44px] items-center px-3">
        {typeof back === 'string' ? (
          <Link href={back} aria-label="뒤로" className={className}>
            {icon}
          </Link>
        ) : (
          <button type="button" onClick={back} aria-label="뒤로" className={className}>
            {icon}
          </button>
        )}
        <h1 className="truncate text-center text-[17px] font-bold text-cocoa-900">{title}</h1>
        <span aria-hidden />
      </div>
    </header>
  );
}

/** 화면 몸통: 내용은 남은 높이 가운데(또는 위), 버튼은 맨 아래 */
function Body({ children, footer, align = 'center' }: { children: ReactNode; footer: ReactNode; align?: 'center' | 'top' }) {
  return (
    <div className="flex min-h-[calc(100dvh-56px-env(safe-area-inset-top))] flex-col px-6 pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <div className={cn('flex flex-1 flex-col', align === 'center' ? 'justify-center py-8' : 'pt-4 pb-8')}>{children}</div>
      <div className="flex flex-col gap-2.5">{footer}</div>
    </div>
  );
}

function Runner({ test }: { test: PsychTest }) {
  const router = useRouter();
  const store = useStore();
  const [started, setStarted] = useState(false);
  const [picks, setPicks] = useState<number[]>([]);
  // 지금 문항에서 고른 선택지 (잠깐 표시했다가 자동으로 다음 문항으로)
  const [selected, setSelected] = useState<number | null>(null);
  // 넘어가는 중 연타 방지
  const pending = useRef(false);

  if (!started) {
    return (
      <>
        <TestHeader title="마음 테스트 숲" back="/tests" />
        <Body
          footer={
            <button type="button" onClick={() => setStarted(true)} className={primary}>
              테스트 시작하기
            </button>
          }
        >
          {/* 아래 여백만큼 묶음 전체가 가운데에서 살짝 위로 */}
          <div className="flex flex-col items-center pb-10 text-center">
            <Image src="/village/friends-row.webp" alt="" width={635} height={164} preload className="h-auto w-[340px] max-w-full" />
            <h2 className="mt-0.5 text-[36px] leading-tight font-bold break-keep text-cocoa-900">{test.title}</h2>
            <p className="mt-4 max-w-[260px] text-sm leading-relaxed break-keep text-taupe-500">{test.subtitle}</p>
            <p className={`mt-5 rounded-full ${BEIGE} px-4 py-1.5 text-[13px] font-semibold text-taupe-500`}>
              {test.questions.length}문항 · {test.minutes}분
            </p>
          </div>
        </Body>
      </>
    );
  }

  const index = picks.length;
  const total = test.questions.length;
  const question = test.questions[index];

  /** 선택지를 누르면 잠깐 선택 표시를 보여 주고 바로 다음 문항(마지막이면 결과)으로 */
  function pick(i: number) {
    if (pending.current) return;
    pending.current = true;
    setSelected(i);
    setTimeout(() => {
      pending.current = false;
      const all = [...picks, i];
      if (all.length < total) {
        setPicks(all);
        setSelected(null);
        return;
      }
      const result = resultFor(test, all);
      // 문항별로 고른 답도 저장한다: 오목이가 대화에서 나를 떠올리는 재료
      const answers = all.map((choice, qi) => ({ q: test.questions[qi].text, a: test.questions[qi].choices[choice].label }));
      store.saveTestResult(test.id, result.id, result.mood, answers);
      router.replace(`/tests/${test.id}?result=${result.id}`);
    }, 160);
  }

  /** 뒤로: 앞 문항으로 (앞에서 고른 답을 다시 보여 준다). 첫 문항이면 시작 화면으로 */
  function back() {
    pending.current = false;
    if (index === 0) {
      setStarted(false);
      setSelected(null);
      return;
    }
    setSelected(picks[index - 1]);
    setPicks(picks.slice(0, -1));
  }

  return (
    <>
      <TestHeader title="마음 테스트 숲" back={back} />
      <Body align="top" footer={null}>
        <div className="flex items-center gap-4">
          <span className="shrink-0 text-[15px] font-semibold text-cocoa-900 tabular-nums">
            {index + 1} / {total}
          </span>
          <div
            className={`h-1.5 flex-1 overflow-hidden rounded-full ${BEIGE}`}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={index + 1}
            aria-label="진행"
          >
            <div className="h-full rounded-full bg-leaf-600 transition-all" style={{ width: `${((index + 1) / total) * 100}%` }} />
          </div>
        </div>

        <h2 key={index} className="mt-12 animate-[omok-fade_0.25s_ease-out] text-center text-[20px] leading-snug font-bold break-keep text-cocoa-900">
          {question.text}
        </h2>
        <ul role="radiogroup" aria-label="선택지" className="mt-6 space-y-3">
          {question.choices.map((choice, i) => {
            const checked = selected === i;
            return (
              <li key={`${index}-${i}`}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => pick(i)}
                  className={cn(
                    'flex min-h-[58px] w-full items-center gap-3 rounded-2xl border px-5 py-3.5 text-left transition-colors',
                    checked ? 'border-leaf-600 bg-leaf-600/10' : 'border-cream-line bg-surface active:bg-black/[0.03]',
                  )}
                >
                  <span className="min-w-0 flex-1 text-[15px] leading-snug font-semibold break-keep text-cocoa-900">{choice.label}</span>
                  <span
                    aria-hidden
                    className={cn('grid size-5 shrink-0 place-items-center rounded-full border', checked ? 'border-leaf-600' : 'border-taupe-500/50')}
                  >
                    {checked && <span className="size-3 rounded-full bg-leaf-600" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Body>
    </>
  );
}

function ResultView({ test, result }: { test: PsychTest; result: TestResult }) {
  return (
    <>
      <TestHeader title="테스트 결과" back="/tests" />
      <Body
        footer={
          <>
            <Link href={`/create?method=test&test=${test.id}&result=${result.id}`} className={primary}>
              이 유형으로 노래 만들기
            </Link>
            <Link href={`/tests/${test.id}`} className={secondary}>
              테스트 다시 하기
            </Link>
            <Link href="/tests" className={secondary}>
              다른 테스트 보기
            </Link>
          </>
        }
      >
        <div className="flex flex-col items-center text-center">
          <Image
            src={`/village/friends-full/${FAMILY_FRIEND[result.music.family]}.webp`}
            alt=""
            width={136}
            height={161}
            preload
            className="h-[150px] w-auto motion-safe:animate-[omok-bob_3.2s_ease-in-out_infinite]"
          />
          <h2 className="mt-5 text-[28px] leading-snug font-bold break-keep text-cocoa-900">{result.name}</h2>
          <p className="mt-3 text-base leading-snug font-bold break-keep text-cocoa-900">{result.summary}</p>
          <p className="mt-4 max-w-[300px] text-sm leading-relaxed break-keep text-taupe-500">{result.description}</p>
        </div>
      </Body>
    </>
  );
}
