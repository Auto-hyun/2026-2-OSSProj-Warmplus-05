'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppBar } from '@/components/layout/AppBar';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getTest } from '@/data/tests';
import { cn } from '@/lib/cn';
import { resultFor } from '@/lib/tests';
import { useStore } from '@/lib/storage/useOngi';

/** 테스트 진행: 시작 안내 → 문항 한 장씩 → 결과 저장 후 결과 화면으로 */
export function TestRunner({ testId }: { testId: string }) {
  const test = getTest(testId)!;
  const store = useStore();
  const router = useRouter();
  /** -1은 시작 안내, 0부터는 문항 번호 */
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<number[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // 문항이 바뀌면 화면 읽기 프로그램이 새 문항부터 읽도록 포커스를 옮긴다
  useEffect(() => {
    if (step >= 0) headingRef.current?.focus();
  }, [step]);

  function choose(value: number) {
    const next = [...answers.slice(0, step), value];
    if (next.length < test.questions.length) {
      setAnswers(next);
      setStep(step + 1);
      return;
    }
    const result = resultFor(test, next);
    store.saveTestResult(test.id, result.id);
    router.replace(`/tests/${test.id}/result/${result.id}`);
  }

  if (step < 0) {
    return (
      <>
        <AppBar title="심리테스트" backHref="/tests" />
        <div className="flex flex-col items-center px-6 pt-6 pb-10 text-center">
          <span aria-hidden className="grid size-24 place-items-center rounded-3xl text-5xl" style={{ background: test.tint }}>
            {test.emoji}
          </span>
          <h2 className="mt-5 text-2xl font-bold text-ink-900">{test.title}</h2>
          <p className="mt-2 text-[15px] text-ink-600">{test.subtitle}</p>
          <p className="mt-1 text-sm text-ink-400">
            {test.questions.length}문항 · 약 {test.minutes}분
          </p>
          <p className="mt-6 w-full rounded-2xl bg-surface px-4 py-3 text-left text-sm leading-relaxed text-ink-600">
            &lsquo;{test.prompt}&rsquo; 뒤에 이어지는 문장을 읽고, 나와 가장 가까운 답을 골라 주세요. 진단이 아니라 나를 돌아보기 위한
            참고용이에요.
          </p>
          <Button size="lg" full className="mt-8" onClick={() => setStep(0)}>
            시작하기
          </Button>
          <p className="mt-3 text-xs text-ink-400">원작: {test.source.name}</p>
        </div>
      </>
    );
  }

  const question = test.questions[step];
  const total = test.questions.length;

  return (
    <>
      <AppBar title={test.title} backHref="/tests" />
      <div className="px-5 pb-10">
        <div className="flex items-center gap-3">
          <ProgressBar value={(step + 1) / total} label="진행률" />
          <span className="shrink-0 text-sm font-semibold text-ink-600 tabular-nums">
            {step + 1} / {total}
          </span>
        </div>

        <p className="mt-8 text-sm font-semibold text-brown-600">{test.prompt}</p>
        <h2 ref={headingRef} tabIndex={-1} className="mt-2 min-h-[3.5em] text-[22px] leading-snug font-bold text-ink-900 outline-none">
          {question.text}
        </h2>

        <ul className="mt-6 space-y-2.5">
          {test.choices.map((choice) => {
            const picked = answers[step] === choice.value;
            return (
              <li key={choice.value}>
                <button
                  type="button"
                  aria-pressed={picked}
                  onClick={() => choose(choice.value)}
                  className={cn(
                    'min-h-13 w-full rounded-2xl border px-4 py-3 text-left text-base transition-colors',
                    picked ? 'border-brown-600 bg-yellow-100 font-semibold text-ink-900' : 'border-line bg-surface text-ink-900 active:bg-yellow-100',
                  )}
                >
                  {choice.label}
                </button>
              </li>
            );
          })}
        </ul>

        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="mx-auto mt-6 flex min-h-11 items-center rounded-full px-4 text-sm text-ink-600 active:bg-black/5"
          >
            이전 문항
          </button>
        )}
      </div>
    </>
  );
}
