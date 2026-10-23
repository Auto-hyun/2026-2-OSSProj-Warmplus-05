import type { MoodFamily } from '@/data/music';
import type { TaskStatus } from './types';

/**
 * 샘플 곡 모드: Suno 없이 작곡 흐름을 흉내 낸다 (개발·시연용, 돈이 들지 않는다).
 * 감정 갈래마다 public/samples에 넣어 둔 곡 2개를 몇 초 뒤에 돌려준다.
 * 작업 번호에 갈래와 시작 시각을 담아 서버에 따로 저장할 필요가 없다.
 */
export const SAMPLE_DELAY_MS = 4000;
const TASK_ID = /^sample-(sad|stress|happy|calm)-(\d{13})$/;

export function createSampleTask(family: MoodFamily, now: number = Date.now()): string {
  return `sample-${family}-${now}`;
}

export function isSampleTaskId(taskId: string): boolean {
  return TASK_ID.test(taskId);
}

export function getSampleTask(taskId: string, now: number = Date.now()): TaskStatus {
  const match = TASK_ID.exec(taskId);
  if (!match) return { state: 'failed', reason: '없는 작업이에요.' };
  const [, family, startedAt] = match;
  if (now - Number(startedAt) < SAMPLE_DELAY_MS) return { state: 'composing' };
  return {
    state: 'done',
    tracks: [1, 2].map((n) => ({ id: `${taskId}-${n}`, audioUrl: `/samples/${family}-${n}.mp3`, duration: null, temporary: false })),
  };
}
