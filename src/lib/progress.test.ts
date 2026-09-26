import { addDays } from './date';
import {
  missionFor,
  missionScheduleFor,
  nextStageInfo,
  questionFor,
  shouldCelebrate,
  stageForCount,
  swapCandidateFor,
} from './progress';
import { MISSIONS } from '@/data/missions';
import { QUESTIONS } from '@/data/questions';

describe('stageForCount (누적 미션 → 단계)', () => {
  it.each([
    [0, 1],
    [2, 1],
    [3, 2],
    [6, 2],
    [7, 3],
    [14, 3],
    [15, 4],
    [29, 4],
    [30, 5],
    [100, 5],
  ])('%i개 → %i단계', (count, stage) => {
    expect(stageForCount(count)).toBe(stage);
  });
});

describe('nextStageInfo', () => {
  it('처음에는 2단계까지 3개 남았다', () => {
    expect(nextStageInfo(0)).toEqual({ current: 1, next: 2, remaining: 3, ratio: 0 });
  });

  it('5개면 2단계 구간(3~7)의 절반이다', () => {
    expect(nextStageInfo(5)).toEqual({ current: 2, next: 3, remaining: 2, ratio: 0.5 });
  });

  it('다 자라면 다음 단계가 없다', () => {
    expect(nextStageInfo(30)).toEqual({ current: 5, next: null, remaining: 0, ratio: 1 });
    expect(nextStageInfo(45)).toEqual({ current: 5, next: null, remaining: 0, ratio: 1 });
  });
});

describe('questionFor (오늘의 질문)', () => {
  it('같은 날은 같은 질문, 다음 날은 다른 질문', () => {
    expect(questionFor('2026-09-26')).toBe(questionFor('2026-09-26'));
    expect(questionFor('2026-09-27')).not.toBe(questionFor('2026-09-26'));
  });

  it('기준일 이전 날짜도 목록 안의 질문을 준다', () => {
    expect(questionFor('2026-01-01')).toBe(QUESTIONS[0]);
    expect(questionFor('2025-12-31')).toBe(QUESTIONS[QUESTIONS.length - 1]);
  });
});

describe('오늘의 미션', () => {
  const installId = 'install-abc';

  it('같은 기기·같은 날이면 같은 미션', () => {
    expect(missionFor(installId, '2026-09-26').id).toBe(missionFor(installId, '2026-09-26').id);
  });

  it('미션 개수만큼의 연속된 날 동안 겹치지 않는다', () => {
    const ids = new Set<string>();
    for (let i = 0; i < MISSIONS.length; i++) {
      ids.add(missionFor(installId, addDays('2026-09-01', i)).id);
    }
    expect(ids.size).toBe(MISSIONS.length);
  });

  it('기기마다 순서가 다르다', () => {
    const a = missionScheduleFor('install-a').map((m) => m.id);
    const b = missionScheduleFor('install-b').map((m) => m.id);
    expect(a).not.toEqual(b);
  });

  it('교체한 미션이 있으면 그 미션을 준다', () => {
    expect(missionFor(installId, '2026-09-26', 'walk-10').id).toBe('walk-10');
  });

  it('교체 기록의 미션이 목록에 없으면 원래 미션으로 돌아간다', () => {
    expect(missionFor(installId, '2026-09-26', '사라진-미션').id).toBe(missionFor(installId, '2026-09-26').id);
  });

  it('교체 후보는 원래 미션과 다르다', () => {
    for (let i = 0; i < 10; i++) {
      const key = addDays('2026-09-26', i);
      expect(swapCandidateFor(installId, key).id).not.toBe(missionFor(installId, key).id);
    }
  });
});

describe('shouldCelebrate (진화 연출 여부)', () => {
  it('마지막으로 본 단계보다 높아졌을 때만', () => {
    expect(shouldCelebrate(1, 2)).toBe(true);
    expect(shouldCelebrate(2, 2)).toBe(false);
    expect(shouldCelebrate(3, 2)).toBe(false);
  });
});
