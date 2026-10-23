'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AppBar } from '@/components/layout/AppBar';
import { Omok } from '@/components/omok/Omok';
import { Button, ButtonLink } from '@/components/ui/Button';
import { FAMILIES } from '@/data/music';
import { getTest, getTestResult, type PsychTest, type TestResult } from '@/data/tests';
import { resultFor } from '@/lib/tests';
import { useStore } from '@/lib/storage/useApp';

/** 심리테스트 진행 → 결과. 주소에 ?result=가 있으면 그 결과를 바로 보여 준다 (마이페이지에서 다시 보기) */
export function TestScreen({ testId }: { testId: string }) {
  const test = getTest(testId)!;
  const resultId = useSearchParams().get('result');
  const result = resultId ? getTestResult(test, resultId) : undefined;

  return (
    <>
      <AppBar title={test.title} backHref="/" />
      {result ? <ResultView test={test} result={result} /> : <Runner key={resultId ?? 'new'} test={test} />}
    </>
  );
}

function Runner({ test }: { test: PsychTest }) {
  const router = useRouter();
  const store = useStore();
  const [started, setStarted] = useState(false);
  const [picks, setPicks] = useState<number[]>([]);

  if (!started) {
    return (
      <div className="flex flex-col items-center px-6 pt-8 text-center">
        <Omok pose="question" height={140} animated eager />
        <p className="mt-6 text-4xl" aria-hidden>
          {test.emoji}
        </p>
        <h2 className="mt-2 text-xl font-bold">{test.title}</h2>
        <p className="mt-2 text-ink-600">{test.subtitle}</p>
        <p className="mt-1 text-sm text-ink-400">{test.questions.length}문항</p>
        <Button onClick={() => setStarted(true)} className="mt-8 w-full">
          시작하기
        </Button>
      </div>
    );
  }

  const index = picks.length;
  const question = test.questions[index];

  function pick(choice: number) {
    const next = [...picks, choice];
    if (next.length < test.questions.length) {
      setPicks(next);
      return;
    }
    const result = resultFor(test, next);
    store.saveTestResult(test.id, result.id);
    router.replace(`/tests/${test.id}?result=${result.id}`);
  }

  return (
    <div className="px-4 pt-2">
      <div className="flex items-center gap-3">
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={test.questions.length}
          aria-valuenow={index + 1}
          aria-label="진행"
        >
          <div className="h-full rounded-full bg-yellow-500 transition-all" style={{ width: `${((index + 1) / test.questions.length) * 100}%` }} />
        </div>
        <span className="text-sm font-semibold text-ink-600">
          {index + 1} / {test.questions.length}
        </span>
      </div>

      <h2 key={index} className="mt-8 animate-[omok-fade_0.25s_ease-out] text-xl leading-snug font-bold">
        {question.text}
      </h2>
      <ul className="mt-6 space-y-2.5">
        {question.choices.map((choice, i) => (
          <li key={`${index}-${i}`}>
            <button
              type="button"
              onClick={() => pick(i)}
              className="w-full rounded-2xl border border-line bg-surface px-4 py-4 text-left text-[15px] font-medium active:bg-yellow-100"
            >
              {choice.label}
            </button>
          </li>
        ))}
      </ul>
      {index > 0 && (
        <Button variant="ghost" onClick={() => setPicks(picks.slice(0, -1))} className="mt-4">
          이전 문항
        </Button>
      )}
    </div>
  );
}

function ResultView({ test, result }: { test: PsychTest; result: TestResult }) {
  const family = FAMILIES[result.music.family];
  return (
    <div className="px-4 pt-2 pb-10">
      <div className="flex flex-col items-center rounded-3xl border border-line bg-surface px-5 py-7 text-center">
        <Omok pose="heart" height={110} animated eager />
        <p className="mt-4 text-sm font-semibold text-ink-600">나의 결과는</p>
        <p className="mt-1 text-4xl" aria-hidden>
          {result.emoji}
        </p>
        <h2 className="mt-2 text-2xl font-extrabold">{result.name}</h2>
        <p className="mt-2 font-medium text-brown-600">{result.summary}</p>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-600">{result.description}</p>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl p-4" style={{ backgroundColor: family.tint }}>
        <Omok pose="music" height={48} />
        <p className="text-[15px] leading-snug">
          이 유형에는 <b>{family.label}</b>에 어울리는 곡을 만들어 줄게요.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <ButtonLink href={`/create?method=test&test=${test.id}&result=${result.id}`}>이 유형으로 노래 만들기</ButtonLink>
        <ButtonLink href={`/tests/${test.id}`} variant="secondary">
          테스트 다시 하기
        </ButtonLink>
      </div>
    </div>
  );
}
