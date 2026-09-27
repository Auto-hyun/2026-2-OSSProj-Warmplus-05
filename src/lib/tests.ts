import type { PsychTest, ScoreTest, TestResult } from '@/data/tests';

/** 점수 테스트의 점수: 문항 점수 합(역문항은 거꾸로) × multiplier */
export function scoreOf(test: ScoreTest, answers: number[]): number {
  const values = test.choices.map((c) => c.value);
  const flip = Math.max(...values) + Math.min(...values);
  const raw = test.questions.reduce((sum, q, i) => sum + (q.reverse ? flip - answers[i] : answers[i]), 0);
  return raw * test.multiplier;
}

/** 모든 문항의 답(선택지 value)으로 결과를 낸다 */
export function resultFor(test: PsychTest, answers: number[]): TestResult {
  if (answers.length !== test.questions.length) throw new Error('모든 문항에 답해야 결과를 볼 수 있어요.');

  if (test.kind === 'type') {
    const totals = new Map(test.results.map((r) => [r.id, 0]));
    test.questions.forEach((q, i) => totals.set(q.type, (totals.get(q.type) ?? 0) + answers[i]));
    // 같으면 먼저 나온 유형 (항상 같은 결과)
    return test.results.reduce((best, r) => (totals.get(r.id)! > totals.get(best.id)! ? r : best));
  }

  const score = scoreOf(test, answers);
  return test.results.find((r) => score >= r.min) ?? test.results[test.results.length - 1];
}
