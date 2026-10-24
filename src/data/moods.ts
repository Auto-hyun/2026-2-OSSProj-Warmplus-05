/**
 * 마음 날씨 7종. 유리병 구슬, 오늘 기분 기록, 마음 날씨 테스트 결과가 모두 이 목록을 쓴다.
 * color는 구슬 색 (UI에서 그림으로 바꿔도 id는 유지).
 */
export type MoodId = 'joy' | 'flutter' | 'calm' | 'tired' | 'sad' | 'anxious' | 'angry';

export type Mood = { id: MoodId; label: string; weather: string; emoji: string; color: string };

export const MOODS: readonly Mood[] = [
  { id: 'joy', label: '기쁨', weather: '맑음', emoji: '☀️', color: '#F7D749' },
  { id: 'flutter', label: '설렘', weather: '봄바람', emoji: '🌤️', color: '#F4A7B9' },
  { id: 'calm', label: '평온', weather: '잔잔한 구름', emoji: '🌥️', color: '#A8D5BA' },
  { id: 'tired', label: '지침', weather: '안개', emoji: '🌫️', color: '#B8B2A7' },
  { id: 'sad', label: '슬픔', weather: '비', emoji: '🌧️', color: '#8FA9D6' },
  { id: 'anxious', label: '불안', weather: '바람 부는 날', emoji: '🌪️', color: '#B59FD6' },
  { id: 'angry', label: '화남', weather: '천둥번개', emoji: '⛈️', color: '#E07A5F' },
];

export function isMoodId(v: unknown): v is MoodId {
  return MOODS.some((m) => m.id === v);
}

export function getMood(id: MoodId): Mood {
  return MOODS.find((m) => m.id === id)!;
}
