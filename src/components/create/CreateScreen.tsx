'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AppBar } from '@/components/layout/AppBar';
import { Omok, type Pose } from '@/components/omok/Omok';
import { OmokTalk } from '@/components/omok/OmokTalk';
import { toast } from '@/components/ui/Toast';
import { startSong } from '@/lib/music/client';
import { songRequestFor } from '@/lib/music/prompt';
import type { SongSource } from '@/lib/music/types';
import { useApp, useStore } from '@/lib/storage/useApp';
import { Composing } from './Composing';
import { Outcome } from './Outcome';
import { TestMethod } from './TestMethod';
import { WordMethod } from './WordMethod';

type Method = 'test' | 'words';

const METHODS: { value: Method; title: string; hint: string; pose: Pose }[] = [
  { value: 'test', title: '심리테스트로 노래 만들기', hint: '내 유형에 어울리는 곡', pose: 'book' },
  { value: 'words', title: '감정 단어로 노래 만들기', hint: '지금 마음에 맞는 단어로', pose: 'heart' },
];

/** 탭 2: 심리테스트 유형 또는 감정 단어로 노래 만들기 */
export function CreateScreen() {
  const params = useSearchParams();
  const pending = useApp((s) => s.pending[0] ?? null);
  const outcome = useApp((s) => s.outcome);
  const store = useStore();
  // 고른 방법은 주소(?method=)에 둬서, 뒤로 가기로 방법 고르기 화면에 돌아온다
  const param = params.get('method');
  const method: Method | null = param === 'test' || param === 'words' ? param : null;
  const [busy, setBusy] = useState(false);

  async function compose(source: SongSource) {
    const req = songRequestFor(source);
    if (!req || busy) return;
    setBusy(true);
    try {
      const { taskId, mode } = await startSong(source);
      store.addPending({ taskId, title: req.title, source, mode });
    } catch (error) {
      toast(error instanceof Error ? error.message : '작곡을 맡기지 못했어요.', { tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  let body;
  if (pending === undefined || outcome === undefined) body = <div className="h-80" />;
  else if (pending) body = <Composing pending={pending} />;
  else if (outcome) body = <Outcome outcome={outcome} />;
  else if (method === 'test')
    body = <TestMethod picked={{ testId: params.get('test'), resultId: params.get('result') }} busy={busy} onCompose={compose} />;
  else if (method === 'words') body = <WordMethod busy={busy} onCompose={compose} />;
  else
    body = (
      <>
        <OmokTalk pose="music" line="어떤 방법으로 노래를 만들까?" className="pt-2" />
        <div className="grid grid-cols-2 gap-3">
          {METHODS.map((m) => (
            <Link
              key={m.value}
              href={`/create?method=${m.value}`}
              className="flex flex-col items-center rounded-3xl border border-line bg-surface px-3 pt-5 pb-4 text-center transition-colors active:bg-yellow-100"
            >
              <div className="grid h-16 place-items-center">
                <Omok pose={m.pose} height={60} />
              </div>
              <p className="mt-3 leading-snug font-bold">{m.title}</p>
              <p className="mt-1 text-xs text-ink-600">{m.hint}</p>
            </Link>
          ))}
        </div>
      </>
    );

  return (
    <>
      <AppBar title="노래 만들기" backHref={method && !pending && !outcome ? '/create' : undefined} />
      <div className="space-y-4 px-4">{body}</div>
    </>
  );
}
