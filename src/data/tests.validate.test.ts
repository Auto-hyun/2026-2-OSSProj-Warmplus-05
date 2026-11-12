import { describe, expect, it } from 'vitest';
import { TESTS } from './tests';
import { FAMILIES } from './music';
import { MOODS } from './moods';

const FAMILY_IDS = Object.keys(FAMILIES);
const MOOD_IDS = MOODS.map((m) => m.id as string);

describe('심리테스트 데이터 30종', () => {
  it('테스트 30개, id 중복 없음', () => {
    expect(TESTS.length).toBe(30);
    expect(new Set(TESTS.map((t) => t.id)).size).toBe(30);
  });

  for (const t of TESTS) {
    describe(t.id, () => {
      it('문항 6개 × 선택지 4개', () => {
        expect(t.questions.length).toBe(6);
        for (const q of t.questions) expect(q.choices.length).toBe(4);
      });
      it('결과 4개(a,b,c,d), 선택지 type이 결과 id와 일치', () => {
        expect(t.results.map((r) => r.id)).toEqual(['a', 'b', 'c', 'd']);
        for (const q of t.questions) {
          expect([...q.choices.map((c) => c.type)].sort()).toEqual(['a', 'b', 'c', 'd']);
        }
      });
      it('음악 갈래·mood 값 유효, 필수 문구 채움', () => {
        for (const r of t.results) {
          expect(FAMILY_IDS).toContain(r.music.family);
          expect(r.music.style.length).toBeGreaterThan(3);
          if (r.mood) expect(MOOD_IDS).toContain(r.mood);
          expect(r.name.length).toBeGreaterThan(0);
          expect(r.summary.length).toBeGreaterThan(0);
          expect(r.description.length).toBeGreaterThan(10);
        }
        expect(t.thumb).toMatch(/^\/village\/screens\/test-[0-2]\.webp$/);
        expect(['light', 'reflect']).toContain(t.category);
      });
    });
  }
});
