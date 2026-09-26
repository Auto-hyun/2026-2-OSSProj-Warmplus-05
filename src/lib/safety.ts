/**
 * 위기 표현 감지. 공백을 지운 뒤 패턴을 찾는다.
 * "배고파 죽겠다" 같은 관용 표현을 잡지 않도록 '죽겠' 계열은 넣지 않는다.
 * 키워드 방식이라 오탐·미탐이 있을 수 있다(v1에서 감수, Claude 연동 시 프롬프트 지침과 병행).
 */
const CRISIS_PATTERNS = [
  '자살',
  '자해',
  '죽고싶',
  '죽고만싶',
  '죽어버리고싶',
  '죽을래',
  '살기싫',
  '살고싶지않',
  '사라지고싶',
  '없어지고싶',
  '극단적선택',
  '목숨을끊',
  '손목을긋',
  '뛰어내리고싶',
  '뛰어내릴',
  '목을매',
  '유서를',
];

export function detectCrisis(text: string): boolean {
  const normalized = text.replace(/\s+/g, '');
  return CRISIS_PATTERNS.some((pattern) => normalized.includes(pattern));
}

export const SAFETY_MESSAGE =
  '온기님, 지금 많이 힘드시군요. 그 마음을 꺼내 주셔서 정말 고마워요. ' +
  '뱁새는 곁에서 이야기를 들을 수는 있지만, 지금 같은 순간에는 전문가와 꼭 이야기해 주셨으면 해요. ' +
  '아래 번호로 24시간 언제든 연락할 수 있어요.';
