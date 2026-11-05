import { getTest, getTestResult } from '@/data/tests';
import { getWord } from '@/data/words';
import type { AppState, Song } from '@/lib/storage/types';

/** 마이페이지 '내 노래'에 보이는 곡: 저장한 곡만 */
export function savedSongs(state: AppState): Song[] {
  return state.songs.filter((s) => s.saved);
}

/** 글에 배경음악으로 붙일 수 있는 곡: 저장한 곡 + 방금 만든 결과 화면의 곡 */
export function pickableSongs(state: AppState): Song[] {
  const ids = state.outcome && 'songIds' in state.outcome ? state.outcome.songIds : [];
  return state.songs.filter((s) => s.saved || ids.includes(s.id));
}

/** 무엇으로 만든 노래인지: '감정: 슬픔·그리움' 또는 '유형: 예시 유형 A' */
export function sourceLabel(song: Song): string {
  if (song.source.kind === 'words') {
    return `감정: ${song.source.words.map((id) => getWord(id)?.label ?? id).join('·')}`;
  }
  const { testId, resultId } = song.source;
  const test = getTest(testId);
  return `유형: ${(test && getTestResult(test, resultId)?.name) ?? resultId}`;
}
