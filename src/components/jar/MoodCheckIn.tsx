'use client';

import { MOODS, getMood } from '@/data/moods';
import { todayKey } from '@/lib/date';
import { useApp, useStore } from '@/lib/storage/useApp';

/** 오늘 기분 고르기 (뼈대 UI, 디자인은 나중에 교체). 하루 하나, 다시 고르면 바뀐다 */
export function MoodCheckIn() {
  const store = useStore();
  const today = useApp((s) => s.moods.find((m) => m.day === todayKey()));

  return (
    <section aria-label="오늘 기분" className="rounded-2xl border border-line bg-surface p-4">
      <p className="font-bold">{today ? `오늘은 ${getMood(today.mood).emoji} ${getMood(today.mood).weather}` : '오늘 마음 날씨는 어때?'}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {MOODS.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={today?.mood === m.id}
            onClick={() => store.recordMood(m.id)}
            className="rounded-full border border-line px-3 py-1.5 text-sm aria-pressed:bg-yellow-100 aria-pressed:font-bold"
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>
    </section>
  );
}
