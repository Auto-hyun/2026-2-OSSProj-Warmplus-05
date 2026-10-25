'use client';

import Link from 'next/link';
import { CaretRightIcon } from '@phosphor-icons/react';
import { Empty } from '@/components/ui/Empty';
import { getTest, getTestResult } from '@/data/tests';
import { formatDotDate } from '@/lib/date';
import { useApp } from '@/lib/storage/useApp';

/** 지금까지 나온 심리테스트 유형 (최근 것부터). 누르면 결과를 다시 본다 */
export function MyTests() {
  const records = useApp((s) => s.tests);
  if (!records) return null;

  const rows = records.flatMap((record) => {
    const test = getTest(record.testId);
    const result = test && getTestResult(test, record.resultId);
    return test && result ? [{ record, test, result }] : [];
  });

  if (rows.length === 0) {
    return (
      <Empty>
        아직 테스트 결과가 없어요.{' '}
        <Link href="/tests" className="font-semibold text-leaf-600 underline underline-offset-2">
          테스트 하러 가기
        </Link>
      </Empty>
    );
  }

  return (
    <ul className="space-y-2">
      {rows.map(({ record, test, result }) => (
        <li key={record.at}>
          <Link
            href={`/tests/${test.id}?result=${result.id}`}
            className="flex items-center gap-3 rounded-[20px] border border-cream-line bg-surface p-3 active:bg-black/5"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cream text-2xl" aria-hidden>
              {result.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold text-cocoa-900">{result.name}</span>
              <span className="block truncate text-xs text-taupe-500">
                {test.title} · {formatDotDate(record.at)}
              </span>
            </span>
            <CaretRightIcon size={18} className="text-taupe-500" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
