'use client';

import { PauseIcon, PlayIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';
import { useAudio, type PlayableTrack } from './AudioProvider';

type Props = {
  track: PlayableTrack;
  size?: 'sm' | 'md';
  /** leaf: 기본 초록 버튼, soft: 연한 초록 바탕, line: 테두리만 있는 버튼 */
  tone?: 'leaf' | 'soft' | 'line';
  className?: string;
};

const TONES = {
  leaf: 'bg-leaf-600 text-white active:brightness-95',
  soft: 'bg-leaf-600/15 text-leaf-600 active:bg-leaf-600/25',
  line: 'border border-cream-line bg-surface text-cocoa-900 active:bg-black/5',
};

/** 동그란 재생/일시정지 버튼. 이 곡이 재생 중이면 일시정지 모양 */
export function PlayButton({ track, size = 'md', tone = 'leaf', className }: Props) {
  const { current, playing, toggle } = useAudio();
  const active = current?.url === track.url && playing;
  const px = size === 'sm' ? 36 : 44;

  return (
    <button
      type="button"
      onClick={() => toggle(track)}
      aria-label={`${track.title} ${active ? '일시정지' : '재생'}`}
      aria-pressed={active}
      className={cn(
        'grid shrink-0 place-items-center rounded-full transition-colors',
        active ? 'bg-ink-900 text-white' : TONES[tone],
        className,
      )}
      style={{ width: px, height: px }}
    >
      {active ? <PauseIcon size={px * 0.45} weight="fill" aria-hidden /> : <PlayIcon size={px * 0.45} weight="fill" aria-hidden />}
    </button>
  );
}
