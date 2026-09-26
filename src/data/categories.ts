// 동기화 스크립트(tsx)에서도 쓰므로 '@/' 별칭 import를 쓰지 않는다

export type CategoryId =
  | 'love'
  | 'family'
  | 'relationship'
  | 'career'
  | 'work'
  | 'self'
  | 'anxiety'
  | 'loneliness'
  | 'daily'
  | 'news';

export type Category = {
  id: CategoryId;
  label: string;
  emoji: string;
  /** 그림이 없는 레터의 기본 카드 배경색 */
  tint: string;
};

export const CATEGORIES: readonly Category[] = [
  { id: 'love', label: '연애·사랑', emoji: '💞', tint: '#FBE7E4' },
  { id: 'family', label: '가족', emoji: '🏠', tint: '#FDEBD3' },
  { id: 'relationship', label: '친구·관계', emoji: '🤝', tint: '#E8F1E4' },
  { id: 'career', label: '진로·꿈', emoji: '🧭', tint: '#E6EEF8' },
  { id: 'work', label: '직장·일', emoji: '💼', tint: '#EEE9F6' },
  { id: 'self', label: '나·자존감', emoji: '🌱', tint: '#F1F5E0' },
  { id: 'anxiety', label: '불안·지침', emoji: '🍃', tint: '#E6F0EE' },
  { id: 'loneliness', label: '외로움·그리움', emoji: '🌙', tint: '#E9E8F3' },
  { id: 'daily', label: '일상·행복', emoji: '☀️', tint: '#FFF3CF' },
  { id: 'news', label: '온기 소식', emoji: '💌', tint: '#F5EFE6' },
];

const byId = new Map(CATEGORIES.map((c) => [c.id, c]));

export function getCategory(id: CategoryId): Category {
  return byId.get(id)!;
}

export function isCategoryId(v: unknown): v is CategoryId {
  return typeof v === 'string' && byId.has(v as CategoryId);
}
