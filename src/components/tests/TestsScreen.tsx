'use client';

import Link from 'next/link';
import { CaretRightIcon } from '@phosphor-icons/react';
import { AppBar } from '@/components/layout/AppBar';
import { TESTS, getTestResult } from '@/data/tests';
import { useOngi } from '@/lib/storage/useOngi';

/** 심리테스트 탭: 테스트 카드 목록. 해본 테스트에는 내 결과를 붙인다 */
export function TestsScreen() {
  const records = useOngi((s) => s.tests);

  return (
    <>
      <AppBar title="심리테스트" />
      <div className="px-5">
        <p className="text-sm leading-relaxed text-ink-600">짧은 테스트로 요즘의 나를 돌아봐요. 결과는 나의 온기에 남아요.</p>
        <ul className="mt-5 space-y-3">
          {TESTS.map((test) => {
            const record = records?.[test.id];
            const mine = record ? getTestResult(test, record.resultId) : undefined;
            return (
              <li key={test.id} className="rounded-3xl border border-line bg-surface">
                <Link href={`/tests/${test.id}`} className="flex items-center gap-4 rounded-3xl p-4 active:bg-black/[0.02]">
                  <span aria-hidden className="grid size-16 shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: test.tint }}>
                    {test.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-bold text-ink-900">{test.title}</span>
                    <span className="mt-0.5 block text-sm text-ink-600">{test.subtitle}</span>
                    <span className="mt-1.5 block text-xs text-ink-400">
                      {test.questions.length}문항 · 약 {test.minutes}분
                    </span>
                  </span>
                  <CaretRightIcon size={18} className="shrink-0 text-ink-400" aria-hidden />
                </Link>
                {mine && (
                  <Link
                    href={`/tests/${test.id}/result/${mine.id}`}
                    className="mx-4 mb-4 flex min-h-11 items-center justify-between gap-2 rounded-2xl bg-yellow-100 px-3 text-[13px] active:brightness-95"
                  >
                    <span>
                      <span className="text-ink-600">내 결과</span>{' '}
                      <span aria-hidden>{mine.emoji}</span> <b className="text-ink-900">{mine.name}</b>
                    </span>
                    <CaretRightIcon size={14} className="shrink-0 text-ink-400" aria-hidden />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-center text-xs leading-relaxed text-ink-400">
          모든 테스트는 진단이 아니라 나를 돌아보기 위한 참고용이에요.
          <br />
          공개된 심리 척도를 우리말로 옮겨 만들었어요.
        </p>
      </div>
    </>
  );
}
