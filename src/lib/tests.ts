import type { PsychTest, TestResult } from '@/data/tests';

/** 문항마다 고른 선택지 번호로 결과를 낸다. 고른 유형이 가장 많은 것, 같으면 results의 앞선 유형 */
export function resultFor(test: PsychTest, picks: number[]): TestResult {
  if (picks.length !== test.questions.length) throw new Error('모든 문항에 답해야 결과를 볼 수 있어요.');
  const counts = new Map(test.results.map((r) => [r.id, 0]));
  test.questions.forEach((q, i) => {
    const type = q.choices[picks[i]]?.type;
    if (type === undefined || !counts.has(type)) throw new Error('없는 선택지예요.');
    counts.set(type, counts.get(type)! + 1);
  });
  return test.results.reduce((best, r) => (counts.get(r.id)! > counts.get(best.id)! ? r : best));
}
