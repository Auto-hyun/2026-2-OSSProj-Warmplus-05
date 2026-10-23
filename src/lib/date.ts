/** 'YYYY-MM-DD' 형식의 한국 날짜 */
export type DayKey = string;

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const DAY_KEY_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

const kstFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function parse(key: DayKey): [number, number, number] {
  const [y, m, d] = key.split('-').map(Number);
  return [y, m, d];
}

/** 'YYYY-MM-DD' 형식이면서 달력에 실제로 있는 날짜인지 (2026-02-29, 2026-13-45는 아님) */
export function isValidDayKey(key: string): boolean {
  if (!DAY_KEY_FORMAT.test(key)) return false;
  const [y, m, d] = parse(key);
  return new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10) === key;
}

/** 한국 시간 기준 오늘 */
export function todayKey(now: Date = new Date()): DayKey {
  return kstFormatter.format(now);
}

/** '10월 18일 토요일' */
export function formatKoreanDate(key: DayKey): string {
  const [y, m, d] = parse(key);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${m}월 ${d}일 ${weekday}요일`;
}

/** ISO 시각 → 한국 날짜 'YYYY.MM.DD' */
export function formatDotDate(iso: string): string {
  return kstFormatter.format(new Date(iso)).replaceAll('-', '.');
}

/** 글 목록의 '방금 전', '3분 전', '2시간 전', '어제', 그보다 오래면 날짜 */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const seconds = Math.max(0, (now.getTime() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return '방금 전';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}시간 전`;
  if (seconds < 172_800) return '어제';
  return formatDotDate(iso);
}
