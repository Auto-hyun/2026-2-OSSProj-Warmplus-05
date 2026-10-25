'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { CaretRightIcon, MusicNotesSimpleIcon } from '@phosphor-icons/react';
import { AppBar } from '@/components/layout/AppBar';
import { PageHeader } from '@/components/layout/PageHeader';
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

const METHODS: { value: Method; title: string; hint: [string, string]; art: string }[] = [
  { value: 'test', title: '심리테스트로 만들기', hint: ['내 마음을 알아보고 어울리는', '노래를 만나요.'], art: '/village/screens/create-test.webp' },
  { value: 'words', title: '감정 단어로 만들기', hint: ['지금 떠오르는 단어부터', '골라볼까요.'], art: '/village/screens/create-words.webp' },
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
  else return <CreateLanding />;

  return (
    <>
      <AppBar title="노래 만들기" backHref={method && !pending && !outcome ? '/create' : undefined} />
      <div className="space-y-4 px-4">{body}</div>
    </>
  );
}

/** 노래 공방 첫 화면 (Figma): 공방 그림, 소개, 만드는 방법 두 가지 */
function CreateLanding() {
  return (
    <>
      <PageHeader title="노래 공방" />
      <Image src="/village/screens/create-hero.webp" alt="" width={882} height={590} preload sizes="480px" className="-mt-1 h-auto w-full" />
      <div className="px-4 pb-4">
        <h2 className="mt-2 text-center text-[21px] font-bold text-cocoa-900">내 마음이 노래가 되는 곳</h2>
        <p className="mt-1.5 text-center text-[13px] leading-relaxed text-taupe-500">
          지금 이 순간의 마음을 음악으로 표현해 보세요.
          <br />
          온기가 당신의 이야기를 노래로 만들어 드려요.
        </p>

        <div className="mt-5 space-y-3">
          {METHODS.map((m) => (
            <Link
              key={m.value}
              href={`/create?method=${m.value}`}
              className="flex h-[118px] items-center gap-1 rounded-[18px] border border-cream-line bg-surface pr-3 pl-5 transition-transform active:scale-[0.98]"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-base font-bold text-cocoa-900">{m.title}</span>
                <span className="mt-2 block text-[13px] leading-relaxed text-taupe-500">
                  {m.hint[0]}
                  <br />
                  {m.hint[1]}
                </span>
              </span>
              <Image src={m.art} alt="" width={285} height={217} className="h-[96px] w-[126px] shrink-0 mix-blend-multiply" />
              <CaretRightIcon size={18} className="shrink-0 text-taupe-500" aria-hidden />
            </Link>
          ))}
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-cocoa-900">
          <MusicNotesSimpleIcon size={16} aria-hidden />
          만든 노래는 내 기록에서 다시 들을 수 있어요.
        </p>
      </div>
    </>
  );
}
