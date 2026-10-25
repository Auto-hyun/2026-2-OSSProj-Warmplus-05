'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { DotsThreeVerticalIcon, TrashIcon } from '@phosphor-icons/react';
import { useAudio } from '@/components/audio/AudioProvider';
import { PlayButton } from '@/components/audio/PlayButton';
import { Empty } from '@/components/ui/Empty';
import { formatDotDate } from '@/lib/date';
import { sourceLabel } from '@/lib/songs';
import { useApp, useStore } from '@/lib/storage/useApp';

function durationLabel(seconds: number | null): string | null {
  if (seconds === null) return null;
  const s = Math.round(seconds);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** 노래 썸네일 (Figma 원안 그림). 노래 순서대로 돌려 쓴다 */
const COVERS = ['/village/screens/cover-0.webp', '/village/screens/cover-1.webp'];

/** 내가 만든 노래 (Figma 카드, 최근 것부터). ⋮ 메뉴에서 지울 수 있다 */
export function MySongs() {
  const songs = useApp((s) => s.songs);
  const store = useStore();
  const audio = useAudio();
  const [menu, setMenu] = useState<string | null>(null);
  if (!songs) return null;

  if (songs.length === 0) {
    return (
      <Empty>
        아직 만든 노래가 없어요.{' '}
        <Link href="/create" className="font-semibold text-leaf-600 underline underline-offset-2">
          노래 만들러 가기
        </Link>
      </Empty>
    );
  }

  return (
    <ul className="space-y-3">
      {songs.map((song, i) => {
        return (
          <li key={song.id} className="relative flex items-center gap-4 rounded-[18px] border border-cream-line bg-surface py-2.5 pr-1.5 pl-4">
            <Image src={COVERS[i % COVERS.length]} alt="" width={185} height={173} className="h-[77px] w-[82px] shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5">
                <span className="truncate text-base font-bold text-cocoa-900">{song.title}</span>
                {song.mode === 'sample' && <span className="shrink-0 rounded-md bg-cream px-1.5 py-0.5 text-[11px] font-semibold text-taupe-500">샘플</span>}
              </p>
              <p className="truncate text-[13px] text-taupe-500">{sourceLabel(song)}</p>
              <p className="mt-0.5 text-xs text-taupe-500">{durationLabel(song.duration) ?? formatDotDate(song.createdAt)}</p>
            </div>
            <PlayButton track={{ title: song.title, url: song.audioUrl }} tone="leaf" />
            <button
              type="button"
              aria-label={`${song.title} 더 보기`}
              aria-expanded={menu === song.id}
              onClick={() => setMenu(menu === song.id ? null : song.id)}
              className="grid h-10 w-7 shrink-0 place-items-center rounded-full text-taupe-500 active:bg-black/5"
            >
              <DotsThreeVerticalIcon size={22} weight="bold" aria-hidden />
            </button>
            {menu === song.id && (
              <div className="absolute top-12 right-2 z-10 animate-[omok-pop_0.15s_ease-out] rounded-2xl border border-cream-line bg-surface p-1 shadow-[0_8px_20px_rgba(75,46,32,0.14)]">
                <button
                  type="button"
                  onClick={() => {
                    setMenu(null);
                    if (!window.confirm(`'${song.title}' 노래를 지울까요?`)) return;
                    if (audio.current?.url === song.audioUrl) audio.stop();
                    store.removeSong(song.id);
                  }}
                  className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-danger active:bg-black/5"
                >
                  <TrashIcon size={16} aria-hidden />
                  지우기
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
