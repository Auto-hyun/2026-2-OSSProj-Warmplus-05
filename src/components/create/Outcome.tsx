'use client';

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
      <OmokTalk pose="wings" line="짠! 노래가 완성됐어 ♪" className="pt-2" />
      <ul className="space-y-2">
        {songs.map((song) => (
          <li key={song.id}>
            <SongRow song={song} />
          </li>
        ))}
      </ul>
      {sample && (
        <p className="rounded-2xl bg-yellow-100 px-4 py-3 text-sm leading-relaxed text-ink-600">
          샘플 곡이에요. Suno를 연결하면 새로 작곡해요.
        </p>
      )}
      {temporary && (
        <p className="rounded-2xl bg-line px-4 py-3 text-sm leading-relaxed text-ink-600">
          저장하지 못해서 2주 뒤에는 들을 수 없어요.
        </p>
      )}
      <div className="flex flex-col gap-2">
        {songs.length > 0 && <ButtonLink href={`/community/write?song=${encodeURIComponent(songs[0].id)}`}>이 노래와 함께 글쓰기</ButtonLink>}
        <Button variant="secondary" onClick={() => store.dismissOutcome()}>
          새 노래 만들기
        </Button>
      </div>
    </div>
  );
}
