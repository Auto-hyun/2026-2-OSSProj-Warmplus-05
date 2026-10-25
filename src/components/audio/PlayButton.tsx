'use client';

import { PauseIcon, PlayIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';
import { useAudio, type PlayableTrack } from './AudioProvider';

type Props = {
  track: PlayableTrack;
  size?: 'sm' | 'md';
  /** yellow: 기본 노란 버튼, leaf: 마을 화면 초록 버튼, line: 테두리만 있는 버튼 */
  tone?: 'yellow' | 'leaf' | 'line';
  className?: string;
};

const TONES = {
  yellow: 'bg-yellow-500 text-ink-900 active:brightness-95',
  leaf: 'bg-leaf-600 text-white active:brightness-95',
  line: 'border border-cream-line bg-surface text-cocoa-900 active:bg-black/5',
};

/** 동그란 재생/일시정지 버튼. 이 곡이 재생 중이면 일시정지 모양 */
export function PlayButton({ track, size = 'md', tone = 'yellow', className }: Props) {
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
