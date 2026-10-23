import { ZODIACS } from '@/data/fortune';
import { fortuneFor, zodiacOf, zodiacRanking } from './fortune';

describe('zodiacOf', () => {
  it.each([
    ['2000-01-01', '염소자리'],
    ['2000-01-19', '염소자리'],
    ['2000-01-20', '물병자리'],
    ['2000-03-20', '물고기자리'],
    ['2000-03-21', '양자리'],
    ['2000-08-23', '처녀자리'],
    ['2000-11-21', '전갈자리'],
    ['2000-11-22', '사수자리'],
    ['2000-12-21', '사수자리'],
    ['2000-12-22', '염소자리'],
    ['2000-12-31', '염소자리'],
  ])('%s → %s', (date, name) => {
    expect(zodiacOf(date).name).toBe(name);
  });
});

describe('zodiacRanking', () => {
  it('12별자리가 겹치지 않게 한 번씩 들어 있다', () => {
    const ids = zodiacRanking('2026-10-18').map((z) => z.id);
    expect(new Set(ids).size).toBe(12);
    expect(ids.sort()).toEqual(ZODIACS.map((z) => z.id).sort());
  });

  it('같은 날엔 같은 순위, 날이 바뀌면 순위도 바뀐다', () => {
    const today = zodiacRanking('2026-10-18').map((z) => z.id);
    expect(zodiacRanking('2026-10-18').map((z) => z.id)).toEqual(today);
    expect(zodiacRanking('2026-10-19').map((z) => z.id)).not.toEqual(today);
  });
});

describe('fortuneFor', () => {
  const birth = { date: '2003-05-07', time: '07:30' };

  it('같은 사람·같은 날이면 항상 같은 운세', () => {
    expect(fortuneFor(birth, '2026-10-18')).toEqual(fortuneFor(birth, '2026-10-18'));
  });

  it('순위는 오늘의 별자리 순위와 같고, 순위에 맞는 한마디를 준다', () => {
    const fortune = fortuneFor(birth, '2026-10-18');
    const rank = zodiacRanking('2026-10-18').findIndex((z) => z.id === fortune.zodiac.id) + 1;
    expect(fortune.zodiac.name).toBe('황소자리');
    expect(fortune.rank).toBe(rank);
    expect(fortune.luck.length).toBeGreaterThan(0);
    expect(fortune.advice.length).toBeGreaterThan(0);
  });

  it('같은 별자리면 운세·조언이 같다 (오하아사처럼)', () => {
    const a = fortuneFor({ date: '2003-05-07', time: '07:30' }, '2026-10-18');
    const b = fortuneFor({ date: '1999-05-01', time: null }, '2026-10-18');
    expect([b.luck, b.advice]).toEqual([a.luck, a.advice]);
  });

  it('별자리마다 순위가 하나씩: 1위는 최고의 날, 12위는 쉬어 가는 날', () => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const fortunes = ZODIACS.map((z) => fortuneFor({ date: `2000-${pad(z.from[0])}-${pad(z.from[1])}`, time: null }, '2026-10-18'));
    expect(fortunes.map((f) => f.rank).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(fortunes.find((f) => f.rank === 1)!.rankLabel).toBe('최고의 날');
    expect(fortunes.find((f) => f.rank === 12)!.rankLabel).toBe('쉬어 가는 날');
  });

  it('태어난 시각이 다르면 럭키 아이템·컬러가 달라질 수 있다 (한 달 중 하루라도)', () => {
    const differs = Array.from({ length: 30 }, (_, i) => `2026-11-${String(i + 1).padStart(2, '0')}`).some((day) => {
      const a = fortuneFor(birth, day);
      const b = fortuneFor({ ...birth, time: '19:10' }, day);
      return a.color.name !== b.color.name || a.item.name !== b.item.name;
    });
    expect(differs).toBe(true);
  });

  it('태어난 시각을 몰라도 운세를 볼 수 있다', () => {
    expect(fortuneFor({ date: '2003-05-07', time: null }, '2026-10-18').color.hex).toMatch(/^#[0-9A-F]{6}$/);
  });
});
