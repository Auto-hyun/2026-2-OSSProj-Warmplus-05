'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { DotsThreeVerticalIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useAudio } from '@/components/audio/AudioProvider';
import { PlayButton } from '@/components/audio/PlayButton';
import { Empty } from '@/components/ui/Empty';
import { toast } from '@/components/ui/Toast';
import { formatDotDate } from '@/lib/date';
import { savedSongs, sourceLabel } from '@/lib/songs';
import { SONG_TITLE_MAX } from '@/lib/storage/store';
import { useApp, useStore } from '@/lib/storage/useApp';

function durationLabel(seconds: number | null): string | null {
  if (seconds === null) return null;
  const s = Math.round(seconds);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** 노래 썸네일 (Figma 원안 그림). 노래 순서대로 돌려 쓴다 */
const COVERS = ['/village/screens/cover-0.webp', '/village/screens/cover-1.webp'];

/** 내가 저장한 노래 (Figma 카드, 최근 것부터). ⋮ 메뉴에서 이름을 바꾸거나 지울 수 있다 */
export function MySongs() {
  const songs = useApp(savedSongs);
  const store = useStore();
  const audio = useAudio();
  const [menu, setMenu] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; title: string } | null>(null);
  if (!songs) return null;

  function saveTitle(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (store.renameSong(editing.id, editing.title).ok) setEditing(null);
    else
      toast(`노래 이름은 1~${SONG_TITLE_MAX}자로 적어 주세요.`, {
        tone: 'error',
      });
  }

  if (songs.length === 0) {
    return (
      <Empty>
        아직 저장한 노래가 없어요.{' '}
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
            {editing?.id === song.id ? (
              <form onSubmit={saveTitle} className="min-w-0 flex-1 py-1 pr-2">
                <label className="block">
                  <span className="sr-only">노래 이름</span>
                  <input
                    autoFocus
                    value={editing.title}
                    onChange={(e) => setEditing({ id: song.id, title: e.target.value })}
                    onKeyDown={(e) => e.key === 'Escape' && setEditing(null)}
                    maxLength={SONG_TITLE_MAX * 2}
                    className="h-10 w-full rounded-xl border border-cream-line bg-bg px-3 text-[15px] font-bold text-cocoa-900"
                  />
                </label>
                <div className="mt-1.5 flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="h-8 rounded-full border border-cream-line px-3 text-[13px] font-semibold text-cocoa-900 active:bg-black/5"
                  >
                    취소
                  </button>
                  <button type="submit" className="h-8 rounded-full bg-leaf-600 px-3 text-[13px] font-semibold text-white active:brightness-95">
                    저장
                  </button>
                </div>
              </form>
            ) : (
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5">
                  <span className="truncate text-base font-bold text-cocoa-900">{song.title}</span>
                  {song.mode === 'sample' && <span className="shrink-0 rounded-md bg-cream px-1.5 py-0.5 text-[11px] font-semibold text-taupe-500">샘플</span>}
                </p>
                <p className="truncate text-[13px] text-taupe-500">{sourceLabel(song)}</p>
                <p className="mt-0.5 text-xs text-taupe-500">{durationLabel(song.duration) ?? formatDotDate(song.createdAt)}</p>
              </div>
            )}
            {editing?.id !== song.id && (
              <>
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
              </>
            )}
            {menu === song.id && (
              <div className="absolute top-12 right-2 z-10 animate-[omok-pop_0.15s_ease-out] rounded-2xl border border-cream-line bg-surface p-1 shadow-[0_8px_20px_rgba(75,46,32,0.14)]">
                <button
                  type="button"
                  onClick={() => {
                    setMenu(null);
                    setEditing({ id: song.id, title: song.title });
                  }}
                  className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sm font-semibold text-cocoa-900 active:bg-black/5"
                >
                  <PencilSimpleIcon size={16} aria-hidden />
                  이름 바꾸기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenu(null);
                    if (!window.confirm(`'${song.title}' 노래를 지울까요?`)) return;
                    if (audio.current?.url === song.audioUrl) audio.stop();
                    store.removeSong(song.id);
                  }}
                  className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sm font-semibold text-danger active:bg-black/5"
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
