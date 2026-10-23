import { formatDotDate, formatKoreanDate, isValidDayKey, timeAgo, todayKey } from './date';

describe('todayKey', () => {
  it('한국 시간으로 날짜를 센다 (UTC 15시 = 한국 다음 날 0시)', () => {
    expect(todayKey(new Date('2026-10-18T14:59:59Z'))).toBe('2026-10-18');
    expect(todayKey(new Date('2026-10-18T15:00:00Z'))).toBe('2026-10-19');
  });
});

describe('isValidDayKey', () => {
  it.each([
    ['2026-10-18', true],
    ['2024-02-29', true],
    ['2026-02-29', false],
    ['2026-13-01', false],
    ['20261018', false],
  ])('%s → %s', (key, expected) => {
    expect(isValidDayKey(key)).toBe(expected);
  });
});

describe('formatKoreanDate', () => {
  it('월·일·요일', () => {
    expect(formatKoreanDate('2026-10-18')).toBe('10월 18일 일요일');
  });
});

describe('formatDotDate', () => {
  it('한국 날짜를 점으로', () => {
    expect(formatDotDate('2026-10-18T16:00:00Z')).toBe('2026.10.19');
  });
});

describe('timeAgo', () => {
  const now = new Date('2026-10-18T12:00:00Z');
  it.each([
    ['2026-10-18T11:59:30Z', '방금 전'],
    ['2026-10-18T11:55:00Z', '5분 전'],
    ['2026-10-18T09:00:00Z', '3시간 전'],
    ['2026-10-17T10:00:00Z', '어제'],
    ['2026-10-10T10:00:00Z', '2026.10.10'],
  ])('%s → %s', (iso, expected) => {
    expect(timeAgo(iso, now)).toBe(expected);
  });
});
