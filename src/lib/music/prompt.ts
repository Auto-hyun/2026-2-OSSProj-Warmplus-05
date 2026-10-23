import { BASE_STYLE, FAMILIES, type MoodFamily } from '@/data/music';
import { getTest, getTestResult } from '@/data/tests';
import { getWord, MAX_WORDS, type EmotionWord } from '@/data/words';
import { josa } from '@/lib/josa';
import type { SongRequest, SongSource } from './types';

function styleOf(family: MoodFamily, extras: string[]): string {
  return [BASE_STYLE, FAMILIES[family].style, ...extras].join(', ');
}

/** 고른 단어 중 가장 많은 갈래. 같으면 먼저 고른 단어의 갈래 */
function dominantFamily(words: EmotionWord[]): MoodFamily {
  const counts = new Map<MoodFamily, number>();
  for (const w of words) counts.set(w.family, (counts.get(w.family) ?? 0) + 1);
  return words.reduce((best, w) => (counts.get(w.family)! > counts.get(best.family)! ? w : best)).family;
}

/** '설렘의 노래', '설렘과 행복의 노래', '설렘, 행복, 감사의 노래' */
export function wordsTitle(labels: string[]): string {
  if (labels.length === 2) return `${josa(labels[0], '과/와')} ${labels[1]}의 노래`;
  return `${labels.join(', ')}의 노래`;
}

/**
 * 화면에서 보낸 재료를 작곡 요청으로 바꾼다. 서버에서도 다시 부르므로
 * 아는 테스트·유형·단어만 받는다 (모르는 값이면 null). 자유 입력은 받지 않는다.
 */
export function songRequestFor(source: SongSource): SongRequest | null {
  if (source.kind === 'test') {
    const test = getTest(source.testId);
    const result = test && getTestResult(test, source.resultId);
    if (!result) return null;
    return {
      title: `${result.name}의 노래`,
      style: styleOf(result.music.family, [result.music.style]),
      family: result.music.family,
    };
  }

  const ids = source.words;
  if (ids.length < 1 || ids.length > MAX_WORDS || new Set(ids).size !== ids.length) return null;
  const words = ids.map(getWord);
  if (words.some((w) => w === undefined)) return null;
  const picked = words as EmotionWord[];
  const family = dominantFamily(picked);
  return {
    title: wordsTitle(picked.map((w) => w.label)),
    style: styleOf(family, picked.map((w) => w.style)),
    family,
  };
}

/** 요청 본문(JSON)이 SongSource 모양인지 */
export function isSongSource(v: unknown): v is SongSource {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;
  if (s.kind === 'test') return typeof s.testId === 'string' && typeof s.resultId === 'string';
  if (s.kind === 'words') return Array.isArray(s.words) && s.words.every((w) => typeof w === 'string');
  return false;
}
