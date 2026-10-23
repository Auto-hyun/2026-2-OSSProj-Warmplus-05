'use client';

import { XIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';
import { useAudio } from './AudioProvider';
import { PlayButton } from './PlayButton';

/** 재생 중인 곡이 있으면 화면 아래에 떠 있는 작은 재생 바. above="tabs"면 탭 바 위에 */
export function MiniPlayer({ above }: { above: 'tabs' | 'bottom' }) {
  const { current, playing, stop } = useAudio();
  if (!current) return null;

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 z-40 mx-auto max-w-[480px] px-4',
        above === 'tabs' ? 'bottom-[calc(env(safe-area-inset-bottom)+88px)]' : 'bottom-[calc(env(safe-area-inset-bottom)+12px)]',
      )}
    >
      <div className="pointer-events-auto flex animate-[omok-pop_0.2s_ease-out] items-center gap-3 rounded-2xl border border-black/5 bg-white/90 py-2 pr-2 pl-2 shadow-[0_8px_24px_rgba(47,43,40,0.14)] backdrop-blur-xl">
        <PlayButton track={current} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-900">{current.title}</p>
          <p className="text-xs text-ink-400">{playing ? '재생 중' : '일시정지'}</p>
        </div>
        {playing && (
          <span aria-hidden className="flex h-4 items-end gap-0.5">
            {[0, 0.2, 0.4].map((delay) => (
              <span
                key={delay}
                className="h-full w-1 origin-bottom animate-[omok-bar_0.9s_ease-in-out_infinite] rounded-full bg-brown-600"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </span>
        )}
        <button
          type="button"
          onClick={stop}
          aria-label="재생 끄기"
          className="grid size-9 place-items-center rounded-full text-ink-400 active:bg-black/5"
        >
          <XIcon size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
}
