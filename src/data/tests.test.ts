import { STAGES } from './stages';
import { TESTS, getTest } from './tests';

describe('심리테스트 데이터', () => {
  it('3개이고 id가 고유하다', () => {
    expect(TESTS.map((t) => t.id)).toEqual(['coping', 'weather', 'self-esteem']);
    expect(getTest('weather')?.title).toBe('지금 내 마음 날씨');
    expect(getTest('없는-테스트')).toBeUndefined();
  });

  it.each(TESTS.map((t) => [t.id, t] as const))('%s: 문항·선택지·출처가 있고 결과 id가 고유하다', (_id, t) => {
    expect(t.questions.length).toBeGreaterThanOrEqual(5);
    expect(new Set(t.choices.map((c) => c.value)).size).toBe(t.choices.length);
    expect(t.source.citation).toBeTruthy();
    expect(new Set(t.results.map((r) => r.id)).size).toBe(t.results.length);
    for (const r of t.results) {
      expect(STAGES.some((s) => s.no === r.stage)).toBe(true);
      expect(r.tips.length).toBeGreaterThan(0);
      expect(r.reflection).toBeTruthy();
    }
  });

  it('유형 테스트: 모든 문항이 있는 유형을 가리키고, 모든 유형에 문항이 있다', () => {
    for (const t of TESTS) {
      if (t.kind !== 'type') continue;
      const ids = t.results.map((r) => r.id);
      expect(t.questions.every((q) => ids.includes(q.type))).toBe(true);
      expect(ids.every((id) => t.questions.some((q) => q.type === id))).toBe(true);
    }
  });

  it('점수 테스트: 결과는 높은 점수 순이고 마지막은 0점부터라 모든 점수가 결과를 가진다', () => {
    for (const t of TESTS) {
      if (t.kind !== 'score') continue;
      const mins = t.results.map((r) => r.min);
      expect([...mins].sort((a, b) => b - a)).toEqual(mins);
      expect(mins.at(-1)).toBe(0);
    }
  });
});
