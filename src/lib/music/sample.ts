import type { MoodId } from '@/data/moods';
import type { MoodFamily } from '@/data/music';
import { SAMPLE_SONGS } from '@/data/samples';
import { getTest, getTestResult } from '@/data/tests';
import { getWord } from '@/data/words';
import { seededShuffle } from '@/lib/random';
import type { SongSource, TaskStatus } from './types';

/**
 * 샘플 곡 모드: 미리 만들어 둔 곡(public/samples, 목록은 data/samples.ts)에서 골라 작곡 흐름을 흉내 낸다.
 * 고른 감정 단어나 심리테스트 결과를 7가지 감정(결과에 감정이 없으면 갈래)으로 잇고, 그 안에서 2곡을 무작위로 고른다.
 * 그 사람이 이미 가진 곡은 되도록 빼고 고른다. 고른 곡은 작업 번호에 담아 서버에 따로 저장할 필요가 없다.
 */
export const SAMPLE_DELAY_MS = 4000;

/** 이 감정 단어들을 (순서 상관없이) 정확히 골랐을 때만 쓰는 전용 곡 */
const WORD_POOLS: { words: string[]; files: string[] }[] = [
  // 불안 · 스트레스 · 답답함
  { words: ['anxiety', 'stress', 'stuffy'], files: ['unease-1', 'unease-2'] },
];

const SONGS = SAMPLE_SONGS.map((s) => ({ file: s.file, word: getWord(s.word) }));
const FILES = new Set([...SAMPLE_SONGS.map((s) => s.file), ...WORD_POOLS.flatMap((p) => p.files)]);
/** 작업 번호: sample-{곡}.{곡}-{시작 시각} (곡 = 파일 이름, 예: sad-3) */
const TASK_ID = /^sample-([a-z]+-\d{1,3})\.([a-z]+-\d{1,3})-(\d{13})$/;
const SAMPLE_URL = /^\/samples\/([a-z]+-\d{1,3})\.mp3$/;

const sortedKey = (words: string[]) => [...words].sort().join(',');
const filesOfMood = (mood: MoodId) => SONGS.filter((s) => s.word?.mood === mood).map((s) => s.file);
const filesOfFamily = (family: MoodFamily) => SONGS.filter((s) => s.word?.family === family).map((s) => s.file);

/** 고른 단어 중 가장 많은 감정. 같으면 먼저 고른 단어의 감정 */
function dominantMood(moods: MoodId[]): MoodId {
  const counts = new Map<MoodId, number>();
  for (const mood of moods) counts.set(mood, (counts.get(mood) ?? 0) + 1);
  return moods.reduce((best, mood) => (counts.get(mood)! > counts.get(best)! ? mood : best));
}

/** 작곡 재료에 맞는 곡 후보(파일 이름). 모르는 재료면 빈 목록 */
export function sampleCandidates(source: SongSource): string[] {
  if (source.kind === 'words') {
    const special = WORD_POOLS.find((p) => sortedKey(p.words) === sortedKey(source.words));
    if (special) return special.files;
    const words = source.words.map(getWord);
    if (words.length === 0 || words.some((w) => w === undefined)) return [];
    return filesOfMood(dominantMood(words.map((w) => w!.mood)));
  }
  const test = getTest(source.testId);
  const result = test && getTestResult(test, source.resultId);
  if (!result) return [];
  return result.mood ? filesOfMood(result.mood) : filesOfFamily(result.music.family);
}

/** 후보에서 서로 다른 2곡을 무작위로 고른다. 이미 가진 곡은 빼고 고르되, 모자라면 가진 곡도 다시 쓴다 */
export function pickSampleSongs(candidates: string[], owned: ReadonlySet<string>): [string, string] {
  const shuffle = (files: string[]) => seededShuffle(files, Math.floor(Math.random() * 2 ** 32));
  const [first, second] = [...shuffle(candidates.filter((f) => !owned.has(f))), ...shuffle(candidates.filter((f) => owned.has(f)))];
  return [first, second];
}

/** 화면이 보낸 내 곡 주소들에서 샘플 곡 파일 이름만 뽑는다 (다른 값은 버린다) */
export function ownedSampleFiles(urls: unknown): Set<string> {
  if (!Array.isArray(urls)) return new Set();
  return new Set(urls.slice(0, 1000).flatMap((url) => (typeof url === 'string' ? (SAMPLE_URL.exec(url)?.[1] ?? []) : [])));
}

export function createSampleTask(files: [string, string], now: number = Date.now()): string {
  return `sample-${files[0]}.${files[1]}-${now}`;
}

function parseTask(taskId: string): { files: [string, string]; startedAt: number } | null {
  const match = TASK_ID.exec(taskId);
  if (!match || !FILES.has(match[1]) || !FILES.has(match[2])) return null;
  return { files: [match[1], match[2]], startedAt: Number(match[3]) };
}

export function isSampleTaskId(taskId: string): boolean {
  return parseTask(taskId) !== null;
}

export function getSampleTask(taskId: string, now: number = Date.now()): TaskStatus {
  const task = parseTask(taskId);
  if (!task) return { state: 'failed', reason: '없는 작업이에요.' };
  if (now - task.startedAt < SAMPLE_DELAY_MS) return { state: 'composing' };
  return {
    state: 'done',
    tracks: task.files.map((file, i) => ({ id: `${taskId}-${i + 1}`, audioUrl: `/samples/${file}.mp3`, duration: null, temporary: false })),
  };
}
