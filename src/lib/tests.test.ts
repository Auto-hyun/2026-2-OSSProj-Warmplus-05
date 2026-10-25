import { TESTS, type PsychTest } from '@/data/tests';
import { resultFor } from './tests';

const test: PsychTest = {
  id: 't',
  title: '',
  subtitle: '',
  emoji: '',
  minutes: 1,
  tag: '',
  category: 'light',
  thumb: '/village/screens/test-0.webp',
  questions: [0, 1, 2].map(() => ({
    text: '',
    choices: [
      { label: '', type: 'x' },
      { label: '', type: 'y' },
    ],
  })),
  results: [
    { id: 'x', name: 'X', emoji: '', summary: '', description: '', music: { family: 'calm', style: '' } },
    { id: 'y', name: 'Y', emoji: '', summary: '', description: '', music: { family: 'happy', style: '' } },
  ],
};

describe('resultFor', () => {
  it('가장 많이 고른 유형이 결과', () => {
    expect(resultFor(test, [1, 1, 0]).id).toBe('y');
    expect(resultFor(test, [0, 1, 0]).id).toBe('x');
  });

  it('같으면 앞선 유형', () => {
    const twoQuestions = { ...test, questions: test.questions.slice(0, 2) };
    expect(resultFor(twoQuestions, [1, 0]).id).toBe('x');
  });

  it('답이 모자라거나 없는 선택지면 오류', () => {
    expect(() => resultFor(test, [0, 1])).toThrow();
    expect(() => resultFor(test, [0, 1, 5])).toThrow();
  });
});

describe('TESTS 데이터', () => {
  it.each(TESTS.map((t) => [t.id, t] as const))('%s: 모든 선택지가 있는 유형을 가리킨다', (_, t) => {
    const ids = new Set(t.results.map((r) => r.id));
    for (const q of t.questions) for (const c of q.choices) expect(ids.has(c.type)).toBe(true);
  });
});
