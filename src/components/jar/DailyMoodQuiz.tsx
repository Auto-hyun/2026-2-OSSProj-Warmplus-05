'use client';

import { getMood } from '@/data/moods';
import { ButtonLink } from '@/components/ui/Button';
import { quizForDay } from '@/lib/daily';
import { todayKey } from '@/lib/date';
import { useApp } from '@/lib/storage/useApp';

const GLASS = 'flex items-center gap-3 rounded-[20px] border border-white/70 bg-white/60 px-3.5 py-3 shadow-[0_8px_22px_rgba(80,55,20,0.10)] backdrop-blur-md';

/** 홈(오목이 집) 위 유리 카드: 오늘의 마음 날씨 테스트 입구 (테스트는 /today). 했으면 오늘 날씨 */
export function DailyMoodQuiz() {
  const day = useApp(() => todayKey());
  const today = useApp((s) => s.moods.find((m) => m.day === todayKey()));
  if (!day) return <div className="h-[68px]" />;

  if (today) {
    const mood = getMood(today.mood);
    return (
      <section aria-label="오늘의 마음 날씨" className={GLASS}>
        <span className="text-3xl" aria-hidden>
          {mood.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-ink-600">오늘의 마음 날씨</p>
          <p className="font-bold">
            {mood.weather} <span className="font-medium text-ink-600">({mood.label})</span>
          </p>
        </div>
        <ButtonLink href="/today" variant="ghost" className="h-11! px-3! text-sm!">
          다시 하기
        </ButtonLink>
      </section>
    );
  }

  return (
    <section aria-label="오늘의 마음 날씨 테스트" className={GLASS}>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-ink-600">오늘의 마음 날씨 테스트 · {quizForDay(day).title}</p>
        <p className="mt-0.5 text-[15px] font-bold">3문항으로 오늘의 구슬 만들기</p>
      </div>
      <ButtonLink href="/today" className="h-11! px-4! text-sm!">
        시작
      </ButtonLink>
    </section>
  );
}
