'use client';

import Link from 'next/link';
import { TrashIcon } from '@phosphor-icons/react';
import { useAudio } from '@/components/audio/AudioProvider';
import { SongRow } from '@/components/create/SongRow';
import { Empty } from '@/components/ui/Empty';
import { useApp, useStore } from '@/lib/storage/useApp';

/** 내가 만든 노래 (최근 것부터). 지울 수 있다 */
export function MySongs() {
  const songs = useApp((s) => s.songs);
  const store = useStore();
  const audio = useAudio();
  if (!songs) return null;

  if (songs.length === 0) {
    return (
      <Empty>
        아직 만든 노래가 없어요.{' '}
        <Link href="/create" className="font-semibold text-brown-600 underline underline-offset-2">
          노래 만들러 가기
        </Link>
      </Empty>
    );
  }

  return (
    <ul className="space-y-2">
      {songs.map((song) => (
        <li key={song.id}>
          <SongRow
            song={song}
            right={
              <button
                type="button"
                aria-label={`${song.title} 지우기`}
                onClick={() => {
                  if (!window.confirm(`'${song.title}' 노래를 지울까요?`)) return;
                  if (audio.current?.url === song.audioUrl) audio.stop();
                  store.removeSong(song.id);
                }}
                className="grid size-9 shrink-0 place-items-center rounded-full text-ink-400 active:bg-black/5"
              >
                <TrashIcon size={18} aria-hidden />
              </button>
            }
          />
        </li>
      ))}
    </ul>
  );
}
