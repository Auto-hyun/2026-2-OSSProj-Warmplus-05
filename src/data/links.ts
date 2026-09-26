// 동기화 스크립트(tsx)에서도 쓰므로 '@/' 별칭 import를 쓰지 않는다

/** 온기 외부 링크 */
export const LINKS = {
  /** 온라인 고민편지 보내기 (손편지 답장) */
  onlineLetter: 'https://ongibox.co.kr/onlineongibox',
  /** 온기레터 구독 */
  subscribe: 'https://page.stibee.com/subscriptions/195023',
  /** 온기우편함 소개 */
  about: 'https://ongibox.co.kr/aboutongibox',
  /** 온기레터 아카이브 목록 (스티비 공개 JSON) */
  archiveApi: 'https://page.stibee.com/archives/195023/emails',
} as const;
