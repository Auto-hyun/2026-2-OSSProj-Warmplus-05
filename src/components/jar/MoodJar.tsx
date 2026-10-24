'use client';

import type { CSSProperties } from 'react';
import { getMood } from '@/data/moods';
import { todayKey } from '@/lib/date';
import { currentJar, JAR_SIZE } from '@/lib/jar';
import { useApp } from '@/lib/storage/useApp';
import { cn } from '@/lib/cn';

/** 병 안 구슬 자리: 아래 줄부터 5개·4개 번갈아 (어긋나게 쌓기), viewBox 100×140 기준 */
const R = 7;
const SLOTS: { cx: number; cy: number }[] = [];
for (let row = 0; SLOTS.length < JAR_SIZE; row++) {
  const odd = row % 2 === 1;
  for (let col = 0; col < (odd ? 4 : 5) && SLOTS.length < JAR_SIZE; col++) {
    SLOTS.push({ cx: 22 + (odd ? R : 0) + col * (2 * R + 0.5), cy: 124 - row * (2 * R - 1.5) });
  }
}

type Props = {
  className?: string;
  style?: CSSProperties;
  caption?: boolean;
  /** 병 그림 없이 구슬만 그린다. 배경 그림 속 병 안쪽에 겹쳐 놓을 때 쓴다 */
  bare?: boolean;
};

/** 감정 유리병 (코르크 뚜껑·리본). 기록한 날마다 감정 색 구슬이 하나씩 쌓인다 */
export function MoodJar({ className, style, caption = true, bare = false }: Props) {
  const jar = useApp((s) => currentJar(s.moods));
  if (!jar) return null;
  const today = todayKey();

  const marbles = jar.entries.map((entry, i) => {
    const { cx, cy } = SLOTS[i];
    const color = getMood(entry.mood).color;
    const fresh = entry.day === today;
    return (
      <g key={entry.day} className={cn(fresh && 'motion-safe:animate-[jar-drop_0.7s_ease-out]')}>
        <circle cx={cx} cy={cy} r={R} fill={color} />
        <circle cx={cx} cy={cy} r={R} fill="url(#jar-marble-shade)" />
        <circle cx={cx - 2.2} cy={cy - 0.4} r={0.85} fill="#3b2a20" />
        <circle cx={cx + 2.2} cy={cy - 0.4} r={0.85} fill="#3b2a20" />
        <path d={`M${cx - 1.4} ${cy + 1.6} Q${cx} ${cy + 3} ${cx + 1.4} ${cy + 1.6}`} fill="none" stroke="#3b2a20" strokeWidth="0.7" strokeLinecap="round" />
      </g>
    );
  });

  const marbleShade = (
    <radialGradient id="jar-marble-shade" cx="0.35" cy="0.3" r="0.75">
      <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
      <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
      <stop offset="1" stopColor="#5a3a20" stopOpacity="0.18" />
    </radialGradient>
  );

  if (bare) {
    return (
      <svg
        viewBox="14 40 74 92"
        preserveAspectRatio="xMidYMax meet"
        role="img"
        aria-label={`감정 유리병 ${jar.entries.length}/${JAR_SIZE}`}
        className={cn('pointer-events-none overflow-visible', className)}
        style={style}
      >
        <defs>{marbleShade}</defs>
        <g opacity="0.94">{marbles}</g>
      </svg>
    );
  }

  return (
    <figure className={cn('pointer-events-none flex flex-col items-center', className)} aria-label={`감정 유리병 ${jar.entries.length}/${JAR_SIZE}`}>
      <svg viewBox="0 0 100 140" className="h-full w-auto overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="jar-glass" x1="0" x2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="0.5" stopColor="#fff6ea" stopOpacity="0.3" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.65" />
          </linearGradient>
          <linearGradient id="jar-cork" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d7a874" />
            <stop offset="1" stopColor="#b98450" />
          </linearGradient>
          {marbleShade}
          <clipPath id="jar-inside">
            <path d="M24 30 Q12 32 12 46 V124 Q12 134 24 134 H76 Q88 134 88 124 V46 Q88 32 76 30 Z" />
          </clipPath>
        </defs>
        {/* 병 몸통 */}
        <path d="M24 30 Q12 32 12 46 V124 Q12 134 24 134 H76 Q88 134 88 124 V46 Q88 32 76 30 Z" fill="url(#jar-glass)" stroke="#e6d6c2" strokeWidth="2" />
        {/* 구슬: 감정 색 털뭉치에 작은 얼굴 */}
        <g clipPath="url(#jar-inside)">{marbles}</g>
        {/* 유리 반사광 */}
        <path d="M19 52 Q19 42 26 38" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
        <path d="M19 60 V100" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
        {/* 병목, 코르크 뚜껑, 리본 */}
        <rect x="26" y="20" width="48" height="11" rx="3" fill="url(#jar-glass)" stroke="#e6d6c2" strokeWidth="2" />
        <rect x="29" y="4" width="42" height="17" rx="4" fill="url(#jar-cork)" stroke="#a87443" strokeWidth="1" />
        {[34, 42, 51, 60, 66].map((x, k) => (
          <circle key={x} cx={x} cy={k % 2 ? 9 : 15} r="0.9" fill="#9c6a3c" opacity="0.6" />
        ))}
        <path d="M26 25 H74" stroke="#a9bf9f" strokeWidth="3" />
        <path d="M74 25 q8 -7 10 -1 q-4 4 -10 1 Z M74 25 q9 2 7 8 q-5 -1 -7 -8 Z" fill="#a9bf9f" stroke="#8aa580" strokeWidth="0.8" />
      </svg>
      {caption && (
        <figcaption className="mt-1 text-xs font-semibold text-ink-600">
          {jar.entries.length}/{JAR_SIZE}
        </figcaption>
      )}
    </figure>
  );
}
