export type Helpline = {
  name: string;
  number: string;
  note: string;
};

/** 마음이 많이 힘들 때 도움받을 수 있는 곳 */
export const HELPLINES: readonly Helpline[] = [
  { name: '자살예방상담전화', number: '109', note: '24시간, 누구나' },
  { name: '정신건강위기상담', number: '1577-0199', note: '24시간 정신건강 상담' },
  { name: '청소년상담', number: '1388', note: '24시간, 청소년' },
  { name: '구급 · 화재', number: '119', note: '위급한 상황' },
  { name: '경찰', number: '112', note: '위급한 상황' },
];
