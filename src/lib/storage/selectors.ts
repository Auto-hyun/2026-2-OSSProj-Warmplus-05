import { daysBetween, isSameMonth, type DayKey } from '@/lib/date';
import { stageForCount } from '@/lib/progress';
import type { StageNo } from '@/data/stages';
import type { OngiState } from './types';

export function completedCount(s: OngiState): number {
  return Object.keys(s.missions.records).length;
}

/** 누적 미션 수로 정해지는 실제 단계 (진화 판정 기준) */
export function realStage(s: OngiState): StageNo {
  return stageForCount(completedCount(s));
}

/** 화면에 보여줄 단계 (시연 모드의 강제 표시 우선) */
export function displayStage(s: OngiState): StageNo {
  return s.settings.stageOverride ?? realStage(s);
}

export function monthCompletedCount(s: OngiState, year: number, month: number): number {
  return Object.keys(s.missions.records).filter((d) => isSameMonth(d, year, month)).length;
}

/** 내가 한 마디라도 얘기한 날 수 */
export function talkedDaysCount(s: OngiState): number {
  return Object.values(s.chats).filter((day) => day.messages.some((m) => m.role === 'user')).length;
}

/** 함께한 날 (시작일이 1일째) */
export function daysTogether(s: OngiState, today: DayKey): number {
  return Math.max(1, daysBetween(s.profile.startedOn, today) + 1);
}
