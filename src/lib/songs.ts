import { getTest, getTestResult } from '@/data/tests';
import { getWord } from '@/data/words';
import type { Song } from '@/lib/storage/types';

/** 무엇으로 만든 노래인지: '감정: 슬픔·그리움' 또는 '유형: 예시 유형 A' */
export function sourceLabel(song: Song): string {
  if (song.source.kind === 'words') {
    return `감정: ${song.source.words.map((id) => getWord(id)?.label ?? id).join('·')}`;
  }
  const { testId, resultId } = song.source;
  const test = getTest(testId);
  return `유형: ${(test && getTestResult(test, resultId)?.name) ?? resultId}`;
}
