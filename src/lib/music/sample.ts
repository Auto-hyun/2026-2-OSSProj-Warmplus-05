import type { MoodFamily } from '@/data/music';
import type { SongSource, TaskStatus } from './types';

/**
 * 샘플 곡 모드: Suno 없이 작곡 흐름을 흉내 낸다 (개발·시연용, 돈이 들지 않는다).
 * 곡 풀(감정 갈래, 또는 아래 단어 조합 전용 풀)마다 public/samples에 넣어 둔 곡 2개를 몇 초 뒤에 돌려준다.
 * 작업 번호에 곡 풀과 시작 시각을 담아 서버에 따로 저장할 필요가 없다.
 */
export const SAMPLE_DELAY_MS = 4000;

/** 이 감정 단어들을 (순서 상관없이) 정확히 골랐을 때만 쓰는 전용 곡 풀: public/samples/{pool}-1·2.mp3 */
const WORD_POOLS: { pool: string; words: string[] }[] = [
  // 불안 · 스트레스 · 답답함
  { pool: 'unease', words: ['anxiety', 'stress', 'stuffy'] },
];

const POOLS = ['sad', 'stress', 'happy', 'calm', ...WORD_POOLS.map((p) => p.pool)];
const TASK_ID = new RegExp(`^sample-(${POOLS.join('|')})-(\\d{13})$`);

const sortedKey = (words: string[]) => [...words].sort().join(',');

/** 작곡 재료에 맞는 샘플 곡 풀. 전용 풀이 있는 단어 조합이면 그 풀, 아니면 감정 갈래 */
export function samplePoolFor(source: SongSource, family: MoodFamily): string {
  if (source.kind === 'words') {
    const match = WORD_POOLS.find((p) => sortedKey(p.words) === sortedKey(source.words));
    if (match) return match.pool;
  }
  return family;
}

export function createSampleTask(pool: string, now: number = Date.now()): string {
  return `sample-${pool}-${now}`;
}

export function isSampleTaskId(taskId: string): boolean {
  return TASK_ID.test(taskId);
}

export function getSampleTask(taskId: string, now: number = Date.now()): TaskStatus {
  const match = TASK_ID.exec(taskId);
  if (!match) return { state: 'failed', reason: '없는 작업이에요.' };
  const [, pool, startedAt] = match;
  if (now - Number(startedAt) < SAMPLE_DELAY_MS) return { state: 'composing' };
  return {
    state: 'done',
    tracks: [1, 2].map((n) => ({ id: `${taskId}-${n}`, audioUrl: `/samples/${pool}-${n}.mp3`, duration: null, temporary: false })),
  };
}
