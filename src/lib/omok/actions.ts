/**
 * 오목이가 대화에서 권할 수 있는 바로가기 버튼. 모델은 이 목록의 id만 고를 수 있고,
 * 서버가 id를 검증해서 label·href로 바꿔 내려보낸다 (모델이 임의 링크를 만들 수 없다)
 */
export type OmokAction = { id: string; label: string; href: string };

export const OMOK_ACTIONS: readonly OmokAction[] = [
  { id: 'make-song-test', label: '내 유형으로 노래 만들기', href: '/create?method=test' },
  { id: 'make-song-words', label: '감정 단어로 노래 만들기', href: '/create?method=words' },
  { id: 'do-test', label: '마음 테스트 하러 가기', href: '/tests' },
  { id: 'mood-today', label: '오늘의 마음날씨 기록하기', href: '/today' },
  { id: 'fortune', label: '오하아사 보러 가기', href: '/fortune' },
  { id: 'my-songs', label: '내 노래 들으러 가기', href: '/me' },
  { id: 'write-post', label: '광장에 글 쓰기', href: '/community/free/write' },
];

export function getAction(id: string | null | undefined): OmokAction | null {
  return OMOK_ACTIONS.find((a) => a.id === id) ?? null;
}

/** 모델에게 주는 버튼 규칙 (답장 마지막 줄의 ACTION: 표시는 서버가 떼어 낸다) */
export const ACTION_RULES = `버튼: 답장 아래에 바로가기 버튼을 하나 붙일 수 있어. 어울릴 때만 답장의 마지막 줄에 "ACTION: <id>"를 한 줄로 적어 (이 줄은 사용자에게 보이지 않아). 어울리는 게 없으면 "ACTION: none".
- make-song-test: 노래를 만들고 싶어하고, 기억에 테스트 결과가 있을 때
- do-test: 심심해하거나 테스트를 하고 싶어할 때, 또는 노래를 만들고 싶은데 테스트 결과가 없을 때
- make-song-words: 테스트 말고 지금 떠오르는 감정 단어로 노래를 만들고 싶어할 때
- mood-today: 오늘 기분 이야기를 하는데 아직 오늘 기록이 없을 때
- fortune: 운세나 오하아사 이야기가 나올 때
- my-songs: 전에 만든 노래를 다시 듣고 싶어할 때
- write-post: 이야기를 다른 사람들과 나누고 싶어할 때
버튼은 흐름에 자연스러울 때만 붙이고, 힘들어하는 위기 상황에는 붙이지 마.`;
