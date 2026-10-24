import { DAILY_QUIZZES, type DailyQuiz } from '@/data/dailyQuizzes';
import type { MoodId } from '@/data/moods';
import type { DayKey } from '@/lib/date';

/** 날짜마다 정해진 테스트 (같은 날은 누구나 같은 테스트, 다음 날은 다음 세트) */
export function quizForDay(day: DayKey): DailyQuiz {
  const [y, m, d] = day.split('-').map(Number);
  const dayNumber = Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
  return DAILY_QUIZZES[dayNumber % DAILY_QUIZZES.length];
}

/** 고른 감정 중 가장 많은 것. 같으면 나중 문항에서 고른 감정 (마지막 문항이 결정) */
export function dailyResult(picks: MoodId[]): MoodId {
  if (picks.length === 0) throw new Error('답이 없어요.');
  const counts = new Map<MoodId, number>();
  picks.forEach((m) => counts.set(m, (counts.get(m) ?? 0) + 1));
  const max = Math.max(...counts.values());
  return [...picks].reverse().find((m) => counts.get(m) === max)!;
}
