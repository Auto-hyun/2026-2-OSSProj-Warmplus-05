'use client';

import Link from 'next/link';
import { Omok } from '@/components/omok/Omok';
import { Button, ButtonLink } from '@/components/ui/Button';
import { FAMILIES } from '@/data/music';
import { getTest, getTestResult, TESTS } from '@/data/tests';
import type { SongSource } from '@/lib/music/types';
import { useApp } from '@/lib/storage/useApp';

type Props = {
  /** 결과 화면에서 넘어왔으면 그 결과 (없으면 가장 최근 결과) */
  picked: { testId: string | null; resultId: string | null };
  busy: boolean;
  onCompose: (source: SongSource) => void;
};

/** 방법 1: 심리테스트 유형에 맞는 노래 */
export function TestMethod({ picked, busy, onCompose }: Props) {
  const latest = useApp((s) => s.tests[0] ?? null);
  if (latest === undefined) return null;

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
  return (
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
  );
}
