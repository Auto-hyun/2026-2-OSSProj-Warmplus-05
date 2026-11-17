'use client';

import Link from 'next/link';
import { CaretRightIcon } from '@phosphor-icons/react';
import { Omok } from '@/components/omok/Omok';
import { Button, ButtonLink } from '@/components/ui/Button';
import { FAMILIES } from '@/data/music';
import { getTest, getTestResult, TESTS, type PsychTest, type TestResult } from '@/data/tests';
import type { SongSource } from '@/lib/music/types';
import type { TestRecord } from '@/lib/storage/types';
import { useApp } from '@/lib/storage/useApp';

type Props = {
  /** 결과 화면에서 넘어왔으면 그 결과 (없으면 가장 최근 결과) */
  picked: { testId: string | null; resultId: string | null };
  busy: boolean;
  onCompose: (source: SongSource) => void;
};

/** 지금 보여 주는 결과 말고, 전에 받았던 다른 결과들 (같은 결과는 한 번만, 최대 3개) */
function otherResults(records: TestRecord[], current: { testId: string; resultId: string } | null) {
  const seen = new Set(current ? [`${current.testId}:${current.resultId}`] : []);
  const others: { test: PsychTest; result: TestResult }[] = [];
  for (const record of records) {
    const key = `${record.testId}:${record.resultId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const test = getTest(record.testId);
    const result = test && getTestResult(test, record.resultId);
    if (test && result) others.push({ test, result });
    if (others.length >= 3) break;
  }
  return others;
}

/** 방법 1: 심리테스트 유형에 맞는 노래 */
export function TestMethod({ picked, busy, onCompose }: Props) {
  const records = useApp((s) => s.tests);
  if (records === undefined) return null;
  const latest = records[0] ?? null;

  const from = picked.testId && picked.resultId ? { testId: picked.testId, resultId: picked.resultId } : latest;
  const test = from && getTest(from.testId);
  const result = test && from && getTestResult(test, from.resultId);

  if (!test || !result) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-line bg-surface px-5 py-8 text-center">
        <Omok pose="question" height={96} />
        <p className="mt-4 font-bold">아직 심리테스트 결과가 없어요</p>
        <p className="mt-1 text-sm text-ink-600">테스트를 하면 그 유형에 어울리는 노래를 만들어 줄게요.</p>
        <ButtonLink href={`/tests/${TESTS[0].id}`} className="mt-5 w-full">
          테스트 하러 가기
        </ButtonLink>
      </div>
    );
  }

  const family = FAMILIES[result.music.family];
  const others = otherResults(records, from);
  return (
    <div className="space-y-4">
    <div className="rounded-3xl border border-line bg-surface p-5">
      <p className="text-xs font-semibold text-ink-400">{test.title}</p>
      <div className="mt-2 flex items-center gap-3">
        <span className="text-4xl" aria-hidden>
          {result.emoji}
        </span>
        <div className="min-w-0">
          <p className="text-lg font-bold">{result.name}</p>
          <p className="text-sm text-ink-600">{result.summary}</p>
        </div>
      </div>
      <p className="mt-4 rounded-2xl px-3 py-2 text-sm" style={{ backgroundColor: family.tint }}>
        <b>{family.label}</b>에 어울리는 연주곡을 만들어요
      </p>
      <Button
        onClick={() => onCompose({ kind: 'test', testId: test.id, resultId: result.id })}
        disabled={busy}
        className="mt-4 w-full"
      >
        {busy ? '오목이에게 부탁하는 중…' : '이 유형으로 작곡하기'}
      </Button>
      <Link href={`/tests/${test.id}`} className="mt-3 block text-center text-sm text-ink-400 underline underline-offset-2">
        테스트 다시 하기
      </Link>
    </div>

    {/* 아래 빈 공간: 전에 받은 다른 결과로 바로 만들거나, 새 테스트로 */}
    {others.length > 0 && (
      <div className="rounded-3xl border border-line bg-surface p-5 pt-4 pb-2">
        <p className="text-[15px] font-semibold">다른 결과로 만들기</p>
        <ul className="mt-1 divide-y divide-line">
          {others.map(({ test: t, result: r }) => (
            <li key={`${t.id}:${r.id}`}>
              <Link href={`/create?method=test&test=${t.id}&result=${r.id}`} className="flex items-center gap-3 py-3 active:bg-black/[0.03]">
                <span className="text-2xl" aria-hidden>
                  {r.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold">{r.name}</span>
                  <span className="block truncate text-xs text-ink-400">{t.title}</span>
                </span>
                <CaretRightIcon size={16} className="shrink-0 text-ink-400" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )}
    <ButtonLink href="/tests" variant="secondary" className="w-full">
      새 테스트 하러 가기
    </ButtonLink>
    </div>
  );
}
