'use client';

import Image from 'next/image';
import { OmokTalk } from '@/components/omok/OmokTalk';
import { Button, ButtonLink } from '@/components/ui/Button';
import type { ComposeOutcome } from '@/lib/storage/types';
import { useApp, useStore } from '@/lib/storage/useApp';
import { SongRow } from './SongRow';

/** 마지막 작곡 결과: 완성된 곡 듣기 / 실패 이유 */
export function Outcome({ outcome }: { outcome: ComposeOutcome }) {
  const store = useStore();
  const allSongs = useApp((s) => s.songs) ?? [];

  if ('error' in outcome) {
    return (
      <OmokTalk
        pose="lie"
        line={outcome.error}
        replies={[{ label: '다시 만들기', onSelect: () => store.dismissOutcome(), primary: true }]}
        className="pt-4"
      />
    );
  }

  const songs = outcome.songIds.map((id) => allSongs.find((s) => s.id === id)).filter((s) => s !== undefined);
  const sample = songs.some((s) => s.mode === 'sample');
  const temporary = songs.some((s) => s.temporary);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center pt-1">
        <p
          aria-live="polite"
          className="relative animate-[omok-pop_0.2s_ease-out] rounded-2xl border border-cream-line bg-surface px-4 py-2 text-[15px] font-bold text-cocoa-900"
        >
          짠! 노래가 완성됐어 ♪
          <span aria-hidden className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-r border-b border-cream-line bg-surface" />
        </p>
        <Image src="/village/composer/record.webp" alt="레코드판을 안은 보라 친구" width={173} height={163} preload className="mt-3 h-[136px] w-auto" />
      </div>
      <p className="text-center text-[13px] leading-relaxed text-taupe-500">
        마음에 드는 노래를 <b className="text-leaf-600">저장</b>하면 마이페이지 내 노래에 남아요.
        <br />
        저장하지 않은 노래는 새 노래를 만들면 사라져요.
      </p>
      <ul className="space-y-2.5">
        {songs.map((song) => (
          <li key={song.id}>
            <SongRow song={song} />
          </li>
        ))}
      </ul>
      {sample && (
        <p className="rounded-2xl bg-cream px-4 py-3 text-[13px] leading-relaxed text-cocoa-900">
          샘플 곡이에요. Suno를 연결하면 새로 작곡해요.
        </p>
      )}
      {temporary && (
        <p className="rounded-2xl bg-line px-4 py-3 text-sm leading-relaxed text-ink-600">
          저장하지 못해서 2주 뒤에는 들을 수 없어요.
        </p>
      )}
      <div className="flex flex-col gap-2">
        {songs.length > 0 && (
          <ButtonLink href={`/community/free/write?song=${encodeURIComponent(songs[0].id)}`} className="rounded-full! bg-leaf-600! text-white!">
            이 노래와 함께 글쓰기
          </ButtonLink>
        )}
        <Button variant="secondary" onClick={() => store.dismissOutcome()} className="rounded-full! border-cream-line!">
          새 노래 만들기
        </Button>
      </div>
    </div>
  );
}
