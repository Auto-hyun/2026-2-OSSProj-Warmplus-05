'use client';

import { PlayButton } from '@/components/audio/PlayButton';
import { cn } from '@/lib/cn';
import { sourceLabel } from '@/lib/songs';
import type { Song } from '@/lib/storage/types';

type Props = { songs: Song[]; value: string | null; onChange: (id: string | null) => void };

/** 내 노래 중 하나를 배경음악으로 (미리 듣기 가능) */
export function BgmPicker({ songs, value, onChange }: Props) {
  const options: { id: string | null; title: string; meta?: string; song?: Song }[] = [
    { id: null, title: '배경음악 없이' },
    ...songs.map((song) => ({
      id: song.id,
      title: song.title,
      meta: song.temporary ? `${sourceLabel(song)} · 2주 뒤 사라질 수 있어요` : sourceLabel(song),
      song,
    })),
  ];

  return (
    <div role="radiogroup" aria-label="배경음악" className="space-y-2">
      {options.map((option) => {
        const checked = value === option.id;
        return (
          <div
            key={option.id ?? 'none'}
            className={cn(
              'flex items-center gap-3 rounded-2xl border p-3 transition-colors',
              checked ? 'border-ink-900 bg-yellow-100' : 'border-line bg-surface',
            )}
          >
            {option.song && <PlayButton track={{ title: option.song.title, url: option.song.audioUrl }} size="sm" />}
            <button
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange(option.id)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{option.title}</span>
                {option.meta && <span className="block truncate text-xs text-ink-400">{option.meta}</span>}
              </span>
              <span
                aria-hidden
                className={cn('grid size-5 shrink-0 place-items-center rounded-full border-2', checked ? 'border-ink-900' : 'border-ink-400')}
              >
                {checked && <span className="size-2.5 rounded-full bg-ink-900" />}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
