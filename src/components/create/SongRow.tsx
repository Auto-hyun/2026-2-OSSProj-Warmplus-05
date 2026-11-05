'use client';

import { useState, type FormEvent } from 'react';
import { BookmarkSimpleIcon, CheckIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import { PlayButton } from '@/components/audio/PlayButton';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { formatDotDate } from '@/lib/date';
import { sourceLabel } from '@/lib/songs';
import { SONG_TITLE_MAX } from '@/lib/storage/store';
import type { Song } from '@/lib/storage/types';
import { useStore } from '@/lib/storage/useApp';

function durationLabel(seconds: number | null): string | null {
  if (seconds === null) return null;
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** 방금 만든 노래 한 줄: 재생 + 제목(연필로 이름 바꾸기) + 만든 재료·날짜 + 마이페이지에 저장 */
export function SongRow({ song }: { song: Song }) {
  const store = useStore();
  const [editing, setEditing] = useState<string | null>(null);
  const meta = [sourceLabel(song), durationLabel(song.duration), formatDotDate(song.createdAt)].filter(Boolean).join(' · ');

  function saveTitle(e: FormEvent) {
    e.preventDefault();
    if (editing === null) return;
    if (store.renameSong(song.id, editing).ok) setEditing(null);
    else toast(`노래 이름은 1~${SONG_TITLE_MAX}자로 적어 주세요.`, { tone: 'error' });
  }

  function toggleSaved() {
    store.setSongSaved(song.id, !song.saved);
    toast(song.saved ? '저장을 취소했어요.' : '마이페이지 내 노래에 저장했어요!');
  }

  if (editing !== null) {
    return (
      <form onSubmit={saveTitle} className="rounded-[18px] border border-leaf-600 bg-surface p-2.5">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-taupe-500">노래 이름</span>
          <input
            autoFocus
            value={editing}
            onChange={(e) => setEditing(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setEditing(null)}
            maxLength={SONG_TITLE_MAX * 2}
            className="h-10 w-full rounded-xl border border-cream-line bg-bg px-3 text-[15px] font-bold text-cocoa-900"
          />
        </label>
        <div className="mt-2 flex justify-end gap-1.5">
          <button type="button" onClick={() => setEditing(null)} className="h-8 rounded-full border border-cream-line px-3 text-[13px] font-semibold text-cocoa-900 active:bg-black/5">
            취소
          </button>
          <button type="submit" className="h-8 rounded-full bg-leaf-600 px-3 text-[13px] font-semibold text-white active:brightness-95">
            이름 저장
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-[18px] border border-cream-line bg-surface p-2.5">
      <PlayButton track={{ title: song.title, url: song.audioUrl }} tone="soft" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1">
          <span className="truncate text-[15px] font-bold text-cocoa-900">{song.title}</span>
          <button
            type="button"
            aria-label={`${song.title} 이름 바꾸기`}
            onClick={() => setEditing(song.title)}
            className="grid size-7 shrink-0 place-items-center rounded-full text-taupe-500 active:bg-black/5"
          >
            <PencilSimpleIcon size={15} aria-hidden />
          </button>
        </p>
        <p className="truncate text-xs text-taupe-500">{meta}</p>
      </div>
      <button
        type="button"
        aria-pressed={song.saved}
        onClick={toggleSaved}
        className={cn(
          'inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-[13px] font-bold transition-colors',
          song.saved ? 'bg-leaf-600/15 text-leaf-600' : 'bg-leaf-600 text-white active:brightness-95',
        )}
      >
        {song.saved ? <CheckIcon size={14} weight="bold" aria-hidden /> : <BookmarkSimpleIcon size={14} weight="bold" aria-hidden />}
        {song.saved ? '저장됨' : '저장'}
      </button>
    </div>
  );
}
