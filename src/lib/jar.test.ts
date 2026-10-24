import type { MoodId } from '@/data/moods';
import type { MoodEntry } from '@/lib/storage/types';
import { currentJar, fullJars, JAR_SIZE, shelfMoods, splitJars, summarize } from './jar';

/** 2026-10-01부터 하루씩, 최근 것이 앞 (저장 순서와 같게) */
function days(moods: MoodId[]): MoodEntry[] {
  return moods
    .map((mood, i) => ({ day: `2026-10-${String(i + 1).padStart(2, '0')}`, mood, source: 'checkin' as const, at: '' }))
    .reverse();
}

describe('유리병', () => {
  it('기록이 없으면 빈 병 하나', () => {
    expect(splitJars([])).toEqual([{ number: 1, entries: [], full: false }]);
  });

  it('21개씩 날짜 순으로 나누고, 다 차면 새 병이 생긴다', () => {
    const moods = days(Array(JAR_SIZE).fill('joy'));
    const jars = splitJars(moods);
    expect(jars.map((j) => [j.number, j.entries.length, j.full])).toEqual([
      [1, 21, true],
      [2, 0, false],
    ]);
    expect(jars[0].entries[0].day).toBe('2026-10-01');
  });

  it('지금 병과 다 찬 병', () => {
    const moods = days([...Array(JAR_SIZE).fill('sad'), 'joy', 'calm']);
    expect(currentJar(moods).entries.map((e) => e.mood)).toEqual(['joy', 'calm']);
    expect(fullJars(moods).map((j) => j.number)).toEqual([1]);
  });

  it('기억 선반: 다 찬 병의 구슬만, 최근 것부터', () => {
    const moods = days([...Array(JAR_SIZE - 1).fill('sad'), 'angry', 'joy']);
    expect(shelfMoods(moods, 3).map((e) => e.mood)).toEqual(['angry', 'sad', 'sad']);
    expect(shelfMoods(days(['joy']), 3)).toEqual([]);
  });

  it('요약: 감정별 개수 많은 순, 같으면 MOODS 순서', () => {
    const jar = splitJars(days(['sad', 'joy', 'sad', 'joy', 'angry']))[0];
    expect(summarize(jar)).toEqual({
      number: 1,
      from: '2026-10-01',
      to: '2026-10-05',
      days: 5,
      counts: [
        { mood: 'joy', count: 2 },
        { mood: 'sad', count: 2 },
        { mood: 'angry', count: 1 },
      ],
      top: 'joy',
    });
  });
});
