import { DAILY_QUIZZES } from '@/data/dailyQuizzes';
import { MOODS } from '@/data/moods';
import { dailyResult, quizForDay } from './daily';

describe('오늘의 마음 날씨 테스트', () => {
  it('세트마다 3문항 × 선택지 4개, 7가지 감정이 모두 나온다', () => {
    for (const quiz of DAILY_QUIZZES) {
      expect(quiz.questions).toHaveLength(3);
      quiz.questions.forEach((q) => expect(q.choices).toHaveLength(4));
      const moods = new Set(quiz.questions.flatMap((q) => q.choices.map((c) => c.mood)));
      expect([...moods].sort()).toEqual(MOODS.map((m) => m.id).sort());
    }
  });

  it('id는 겹치지 않는다', () => {
    expect(new Set(DAILY_QUIZZES.map((q) => q.id)).size).toBe(DAILY_QUIZZES.length);
  });

  it('같은 날은 같은 테스트, 다음 날은 다음 세트', () => {
    const a = quizForDay('2026-10-24');
    expect(quizForDay('2026-10-24')).toBe(a);
    const i = DAILY_QUIZZES.indexOf(a);
    expect(quizForDay('2026-10-25')).toBe(DAILY_QUIZZES[(i + 1) % DAILY_QUIZZES.length]);
  });

  it('결과: 가장 많이 고른 감정, 같으면 마지막 문항', () => {
    expect(dailyResult(['sad', 'joy', 'sad'])).toBe('sad');
    expect(dailyResult(['joy', 'calm', 'tired'])).toBe('tired');
    expect(dailyResult(['joy', 'calm', 'calm'])).toBe('calm');
  });
});
