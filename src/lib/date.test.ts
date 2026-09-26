import {
  EPOCH_DAY,
  addDays,
  dayIndex,
  daysBetween,
  formatDotDate,
  formatKoreanDate,
  isSameMonth,
  monthGrid,
  todayKey,
} from './date';

describe('todayKey (한국 시간 기준 오늘)', () => {
  it('UTC로는 전날이어도 한국 자정이 지났으면 한국 날짜를 준다', () => {
    expect(todayKey(new Date('2026-09-25T15:30:00Z'))).toBe('2026-09-26');
  });

  it('한국 자정 직전이면 아직 전날이다', () => {
    expect(todayKey(new Date('2026-09-25T14:59:59Z'))).toBe('2026-09-25');
  });

  it('시연용 dayOffset만큼 날짜를 옮긴다', () => {
    expect(todayKey(new Date('2026-09-25T15:30:00Z'), 2)).toBe('2026-09-28');
  });
});

describe('DayKey 계산', () => {
  it('addDays는 월·연 경계를 넘는다', () => {
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('dayIndex는 기준일(2026-01-01)부터 경과 일수다', () => {
    expect(EPOCH_DAY).toBe('2026-01-01');
    expect(dayIndex('2026-01-01')).toBe(0);
    expect(dayIndex('2026-09-26')).toBe(268);
    expect(dayIndex('2025-12-31')).toBe(-1);
  });

  it('daysBetween은 to - from 일수다', () => {
    expect(daysBetween('2026-09-20', '2026-09-26')).toBe(6);
    expect(daysBetween('2026-09-26', '2026-09-20')).toBe(-6);
  });

  it('isSameMonth는 연·월이 같은지 본다', () => {
    expect(isSameMonth('2026-09-30', 2026, 9)).toBe(true);
    expect(isSameMonth('2026-10-01', 2026, 9)).toBe(false);
    expect(isSameMonth('2025-09-10', 2026, 9)).toBe(false);
  });
});

describe('날짜 표기', () => {
  it('formatKoreanDate는 "M월 D일 요일" 형식이다', () => {
    expect(formatKoreanDate('2026-09-26')).toBe('9월 26일 토요일');
    expect(formatKoreanDate('2026-01-01')).toBe('1월 1일 목요일');
  });

  it('formatDotDate는 ISO 시각을 한국 날짜 YYYY.MM.DD로 바꾼다', () => {
    expect(formatDotDate('2026-08-28T20:00:01+09:00')).toBe('2026.08.28');
    expect(formatDotDate('2026-08-28T16:00:00Z')).toBe('2026.08.29');
  });
});

describe('monthGrid (일요일 시작 달력 칸)', () => {
  it('2026년 9월은 화요일 시작이라 앞칸 2개가 비고 35칸이다', () => {
    const grid = monthGrid(2026, 9);
    expect(grid.slice(0, 2)).toEqual([null, null]);
    expect(grid[2]).toBe('2026-09-01');
    expect(grid).toHaveLength(35);
    const days = grid.filter((d): d is string => d !== null);
    expect(days).toHaveLength(30);
    expect(days[days.length - 1]).toBe('2026-09-30');
  });

  it('칸 수는 항상 7의 배수다', () => {
    for (let m = 1; m <= 12; m++) {
      expect(monthGrid(2026, m).length % 7).toBe(0);
    }
  });
});
