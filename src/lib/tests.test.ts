import { getTest, type PsychTest, type ScoreTest } from '@/data/tests';
import { resultFor, scoreOf } from './tests';

function test(id: string): PsychTest {
  const found = getTest(id);
  if (!found) throw new Error(`없는 테스트: ${id}`);
  return found;
}

function scoreTest(id: string): ScoreTest {
  const found = test(id);
  if (found.kind !== 'score') throw new Error('점수 테스트여야 해요');
  return found;
}

/** 모든 문항에 같은 값을 답한다 */
const all = (t: PsychTest, value: number) => t.questions.map(() => value);

describe('지금 내 마음 날씨 (WHO-5)', () => {
  const weather = scoreTest('weather');

  it('문항 점수(0~5) 합에 4를 곱해 0~100점으로 본다', () => {
    expect(scoreOf(weather, all(weather, 5))).toBe(100);
    expect(scoreOf(weather, all(weather, 0))).toBe(0);
    expect(scoreOf(weather, [5, 4, 3, 2, 1])).toBe(60);
  });

  it.each([
    [[5, 5, 5, 4, 0], 76, 'sunny'],
    [[5, 5, 5, 3, 0], 72, 'cloudy'],
    [[5, 5, 3, 0, 0], 52, 'cloudy'],
    [[5, 5, 2, 0, 0], 48, 'overcast'],
    [[5, 3, 0, 0, 0], 32, 'overcast'],
    [[5, 2, 0, 0, 0], 28, 'rainy'],
  ])('%j → %i점 → %s (세계보건기구 기준: 50점 이하 마음 건강 점검 권유, 28점 이하 전문가 상담 권유)', (answers, score, id) => {
    expect(scoreOf(weather, answers)).toBe(score);
    expect(resultFor(weather, answers).id).toBe(id);
  });

  it('가장 낮은 "비"는 도움 기관 안내가 필요한 결과다', () => {
    expect(resultFor(weather, all(weather, 0)).needsHelp).toBe(true);
    expect(resultFor(weather, all(weather, 5)).needsHelp).toBeFalsy();
  });
});

describe('나의 자존감 온도 (로젠버그)', () => {
  const esteem = scoreTest('self-esteem');
  // 1·3·4·7·10번은 그대로, 2·5·6·8·9번은 거꾸로 센다 (매우 그렇다 3 … 전혀 그렇지 않다 0)
  const answers = (positive: number, negative: number) =>
    esteem.questions.map((q) => (q.reverse ? negative : positive));

  it('부정 문항은 거꾸로 세어 0~30점으로 본다', () => {
    expect(scoreOf(esteem, answers(3, 0))).toBe(30);
    expect(scoreOf(esteem, answers(0, 3))).toBe(0);
    expect(scoreOf(esteem, all(esteem, 2))).toBe(15);
  });

  it.each([
    [answers(3, 0), 'warm'],
    [answers(3, 1), 'cozy'], // 15 + 10 = 25
    [all(esteem, 2), 'cozy'], // 15
    [answers(2, 2), 'cozy'],
    [answers(1, 2), 'chilly'], // 5 + 5 = 10
  ])('%j → %s', (given, id) => {
    expect(resultFor(esteem, given).id).toBe(id);
  });

  it('26점부터 따끈따끈, 15점부터 포근, 14점 이하는 쌀쌀', () => {
    const at = (score: number) => esteem.results.find((r) => score >= r.min)!.id;
    expect([at(26), at(25), at(15), at(14)]).toEqual(['warm', 'cozy', 'cozy', 'chilly']);
  });
});

describe('나의 스트레스 대처 유형 (Brief COPE)', () => {
  const coping = test('coping');
  if (coping.kind !== 'type') throw new Error('유형 테스트여야 해요');
  /** 한 유형 문항에만 4, 나머지는 1 */
  const favor = (type: string) => coping.questions.map((q) => (q.type === type ? 4 : 1));

  it.each(['solver', 'sharer', 'reframer', 'rester'])('%s 문항에 크게 답하면 그 유형이 나온다', (type) => {
    expect(resultFor(coping, favor(type)).id).toBe(type);
  });

  it('점수가 같으면 결과 목록의 앞선 유형이 나온다 (항상 같은 결과)', () => {
    expect(resultFor(coping, all(coping, 2)).id).toBe(coping.results[0].id);
  });
});

describe('resultFor', () => {
  it('답이 문항 수와 다르면 결과를 내지 않는다', () => {
    const weather = test('weather');
    expect(() => resultFor(weather, [5, 5])).toThrow();
  });
});
