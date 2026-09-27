import Link from 'next/link';
import { CaretRightIcon } from '@phosphor-icons/react/ssr';
import { TESTS, getTestResult } from '@/data/tests';
import { formatShortDate } from '@/lib/date';
import type { TestRecord } from '@/lib/storage/types';

/** 나의 테스트 결과: 해본 테스트는 가장 최근 결과로, 안 해본 테스트는 테스트로 이어진다 */
export function TestRecordList({ records }: { records: Record<string, TestRecord> }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-surface">
      {TESTS.map((test) => {
        const record = records[test.id];
        const result = record ? getTestResult(test, record.resultId) : undefined;
        const shown = result ?? test;
        return (
          <li key={test.id}>
            <Link
              href={result ? `/tests/${test.id}/result/${result.id}` : `/tests/${test.id}`}
              className="flex items-center gap-3 px-4 py-3.5 active:bg-black/[0.02]"
            >
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl text-xl" style={{ background: shown.tint }}>
                {shown.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-ink-400">{test.title}</span>
                <span className="block truncate text-[15px] font-medium text-ink-900">{result ? result.name : '아직 안 해봤어요'}</span>
              </span>
              <span className="shrink-0 text-xs text-ink-400">{result && record ? formatShortDate(record.at) : '해보기'}</span>
              <CaretRightIcon size={16} className="shrink-0 text-ink-400" aria-hidden />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
