import type { ReactNode } from 'react';
import { PlayButton } from '@/components/audio/PlayButton';
import { formatDotDate } from '@/lib/date';
import { sourceLabel } from '@/lib/songs';
import type { Song } from '@/lib/storage/types';

function durationLabel(seconds: number | null): string | null {
  if (seconds === null) return null;
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** 내 노래 한 줄: 재생 버튼 + 제목 + 만든 재료·날짜 (오른쪽에 버튼을 더 붙일 수 있다) */
export function SongRow({ song, right }: { song: Song; right?: ReactNode }) {
  const meta = [sourceLabel(song), durationLabel(song.duration), formatDotDate(song.createdAt)].filter(Boolean).join(' · ');
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
      <PlayButton track={{ title: song.title, url: song.audioUrl }} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 font-semibold">
          <span className="truncate">{song.title}</span>
          {song.mode === 'sample' && <span className="shrink-0 rounded-md bg-line px-1.5 py-0.5 text-[11px] font-semibold text-ink-600">샘플</span>}
        </p>
        <p className="truncate text-xs text-ink-400">{meta}</p>
      </div>
      {right}
    </div>
  );
}
