'use client';

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

/** 홈 배경에 놓이는 유리병 (간단 UI, 그림은 나중에 교체). 기록한 날마다 감정 색 구슬이 하나씩 쌓인다 */
export function MoodJar({ className }: { className?: string }) {
  const jar = useApp((s) => currentJar(s.moods));
  if (!jar) return null;
  const today = todayKey();

  return (
    <figure className={cn('pointer-events-none flex flex-col items-center', className)} aria-label={`감정 유리병 ${jar.entries.length}/${JAR_SIZE}`}>
      <svg viewBox="0 0 100 140" className="h-full w-auto overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="jar-glass" x1="0" x2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="0.5" stopColor="#e8f3f6" stopOpacity="0.35" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.6" />
          </linearGradient>
          <clipPath id="jar-inside">
            <path d="M30 26 Q12 34 12 58 V122 Q12 134 26 134 H74 Q88 134 88 122 V58 Q88 34 70 26 Z" />
          </clipPath>
        </defs>
        {/* 병 몸통 */}
        <path d="M30 26 Q12 34 12 58 V122 Q12 134 26 134 H74 Q88 134 88 122 V58 Q88 34 70 26 Z" fill="url(#jar-glass)" stroke="#c9dde3" strokeWidth="2" />
        {/* 구슬 */}
        <g clipPath="url(#jar-inside)">
          {jar.entries.map((entry, i) => {
            const { cx, cy } = SLOTS[i];
            const color = getMood(entry.mood).color;
            const fresh = entry.day === today;
            return (
              <g key={entry.day} className={cn(fresh && 'motion-safe:animate-[jar-drop_0.7s_ease-out]')}>
                <circle cx={cx} cy={cy} r={R} fill={color} />
                <circle cx={cx - 2.2} cy={cy - 2.4} r={2} fill="#ffffff" opacity="0.55" />
              </g>
            );
          })}
        </g>
        {/* 유리 반사광 */}
        <path d="M20 60 Q20 44 30 38" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        {/* 병목과 뚜껑 */}
        <rect x="30" y="16" width="40" height="11" rx="3" fill="url(#jar-glass)" stroke="#c9dde3" strokeWidth="2" />
        <rect x="27" y="6" width="46" height="11" rx="4" fill="#d9b77e" stroke="#b8935a" strokeWidth="1.5" />
      </svg>
      <figcaption className="mt-1 text-xs font-semibold text-ink-600">
        {jar.entries.length}/{JAR_SIZE}
      </figcaption>
    </figure>
  );
}
