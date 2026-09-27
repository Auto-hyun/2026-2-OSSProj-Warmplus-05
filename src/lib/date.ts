/** 'YYYY-MM-DD' 형식의 한국 날짜 */
export type DayKey = string;

/** 오늘의 질문·미션 순번을 세는 기준일 */
export const EPOCH_DAY: DayKey = '2026-01-01';

const MS_PER_DAY = 86_400_000;
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

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

/** DayKey → UTC 자정 기준 경과 일수 (시간대 영향 없음) */
function toDayNumber(key: DayKey): number {
  const [y, m, d] = parse(key);
  return Date.UTC(y, m - 1, d) / MS_PER_DAY;
}

function fromDayNumber(n: number): DayKey {
  return new Date(n * MS_PER_DAY).toISOString().slice(0, 10);
}

const DAY_KEY_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

/** 'YYYY-MM-DD' 형식이면서 달력에 실제로 있는 날짜인지 (2026-02-29, 2026-13-45는 아님) */
export function isValidDayKey(key: string): boolean {
  return DAY_KEY_FORMAT.test(key) && addDays(key, 0) === key;
}

/** 한국 시간 기준 오늘. dayOffset은 시연 모드의 날짜 이동 */
export function todayKey(now: Date = new Date(), dayOffset = 0): DayKey {
  const key = kstFormatter.format(now);
  return dayOffset === 0 ? key : addDays(key, dayOffset);
}

/** 다음 한국 자정까지 남은 밀리초 (한국은 서머타임이 없어 UTC+9 고정) */
export function msUntilNextKstMidnight(now: Date): number {
  const kstMs = now.getTime() + 9 * 3_600_000;
  const intoDay = ((kstMs % MS_PER_DAY) + MS_PER_DAY) % MS_PER_DAY;
  return MS_PER_DAY - intoDay;
}

export function addDays(key: DayKey, n: number): DayKey {
  return fromDayNumber(toDayNumber(key) + n);
}

export function dayIndex(key: DayKey): number {
  return toDayNumber(key) - toDayNumber(EPOCH_DAY);
}

export function daysBetween(from: DayKey, to: DayKey): number {
  return toDayNumber(to) - toDayNumber(from);
}

export function isSameMonth(key: DayKey, year: number, month: number): boolean {
  const [y, m] = parse(key);
  return y === year && m === month;
}

/** '9월 26일 토요일' */
export function formatKoreanDate(key: DayKey): string {
  const [y, m, d] = parse(key);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${m}월 ${d}일 ${weekday}요일`;
}

/** ISO 시각 → 한국 날짜 'YYYY.MM.DD' */
export function formatDotDate(iso: string): string {
  return kstFormatter.format(new Date(iso)).replaceAll('-', '.');
}

/** 저장 시각(ISO) → 한국 날짜 "9월 27일" */
export function formatShortDate(iso: string): string {
  const [, m, d] = parse(todayKey(new Date(iso)));
  return `${m}월 ${d}일`;
}

/** 일요일 시작 달력 칸. 1일 앞의 빈칸과 말일 뒤의 빈칸은 null, 길이는 7의 배수 */
export function monthGrid(year: number, month: number): (DayKey | null)[] {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const lastDate = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (DayKey | null)[] = Array(firstWeekday).fill(null);
  const mm = String(month).padStart(2, '0');
  for (let d = 1; d <= lastDate; d++) {
    cells.push(`${year}-${mm}-${String(d).padStart(2, '0')}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
