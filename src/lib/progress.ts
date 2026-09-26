import { dayIndex, type DayKey } from './date';
import { hashString, seededShuffle } from './random';
import { QUESTIONS } from '@/data/questions';
import { MISSIONS, getMission, type Mission } from '@/data/missions';
import { STAGES, type StageNo } from '@/data/stages';

/** 음수에도 안전한 나머지 */
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function stageForCount(count: number): StageNo {
  let stage: StageNo = 1;
  for (const s of STAGES) {
    if (count >= s.minMissions) stage = s.no;
  }
  return stage;
}

/** 현재 단계와 다음 단계까지 남은 미션 수, 현재 단계 구간 안에서의 진행률(0~1) */
export function nextStageInfo(count: number): {
  current: StageNo;
  next: StageNo | null;
  remaining: number;
  ratio: number;
} {
  const current = stageForCount(count);
  const nextStage = STAGES[current]; // STAGES[current]는 current+1 단계
  if (!nextStage) return { current, next: null, remaining: 0, ratio: 1 };
  const from = STAGES[current - 1].minMissions;
  const to = nextStage.minMissions;
  return {
    current,
    next: nextStage.no,
    remaining: to - count,
    ratio: (count - from) / (to - from),
  };
}

/** 오늘의 질문: 날짜 순서대로 돌아가서 같은 날엔 모두 같은 질문 */
export function questionFor(key: DayKey): string {
  return QUESTIONS[mod(dayIndex(key), QUESTIONS.length)];
}

/** 기기마다 한 번 섞어둔 미션 순서 */
export function missionScheduleFor(installId: string): Mission[] {
  return seededShuffle(MISSIONS, hashString(installId));
}

/** 오늘의 미션. 교체 기록(swappedId)이 유효하면 그 미션 */
export function missionFor(installId: string, key: DayKey, swappedId?: string): Mission {
  const swapped = swappedId ? getMission(swappedId) : undefined;
  if (swapped) return swapped;
  const schedule = missionScheduleFor(installId);
  return schedule[mod(dayIndex(key), schedule.length)];
}

/** '다른 미션'을 눌렀을 때 줄 미션: 순서상 절반 뒤의 미션 */
export function swapCandidateFor(installId: string, key: DayKey): Mission {
  const schedule = missionScheduleFor(installId);
  const offset = Math.floor(schedule.length / 2);
  return schedule[mod(dayIndex(key) + offset, schedule.length)];
}

export function shouldCelebrate(lastSeen: StageNo, current: StageNo): boolean {
  return current > lastSeen;
}
