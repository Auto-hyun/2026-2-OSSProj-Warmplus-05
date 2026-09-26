const HANGUL_FIRST = 0xac00; // 가
const HANGUL_LAST = 0xd7a3; // 힣

/**
 * 받침에 맞는 조사를 붙인다. pair는 '받침 있을 때/없을 때' 순서.
 * josa('콩이', '이/가') → '콩이가', josa('별', '과/와') → '별과'.
 * 마지막 글자가 한글이 아니면(영문·숫자) 둘 다 보여준다: 'Coco이(가)'
 */
export function josa(word: string, pair: `${string}/${string}`): string {
  const [withBatchim, withoutBatchim] = pair.split('/');
  const code = word.charCodeAt(word.length - 1);
  if (!(code >= HANGUL_FIRST && code <= HANGUL_LAST)) return `${word}${withBatchim}(${withoutBatchim})`;
  return word + ((code - HANGUL_FIRST) % 28 === 0 ? withoutBatchim : withBatchim);
}
