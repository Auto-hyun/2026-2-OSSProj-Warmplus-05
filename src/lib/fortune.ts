import { COLORS, ITEMS, TIERS, ZODIACS, type LuckyColor, type LuckyItem, type Zodiac } from '@/data/fortune';
import type { DayKey } from './date';
import { hashString, mulberry32, seededShuffle } from './random';

/** 생년월일과 태어난 시각('HH:MM', 모르면 null) */
export type Birth = { date: DayKey; time: string | null };

export type Fortune = {
  zodiac: Zodiac;
  /** 12별자리 중 오늘 순위 (1~12) */
  rank: number;
  rankLabel: string;
  /** 운세 한 줄과 조언 한 줄 */
  luck: string;
  advice: string;
  item: LuckyItem;
  color: LuckyColor;
};

/** 생일의 별자리 */
export function zodiacOf(date: DayKey): Zodiac {
  const [, m, d] = date.split('-').map(Number);
  const md = m * 100 + d;
  // 시작 날짜가 생일보다 늦지 않은 별자리 중 가장 나중 것. 1월 1~19일은 앞의 염소자리(12월 22일 시작)
  let found = ZODIACS[0];
  for (const z of ZODIACS.slice(1)) {
    if (z.from[0] * 100 + z.from[1] <= md) found = z;
  }
  return md >= 1222 ? ZODIACS[0] : found;
}

/** 오늘의 별자리 순위 (1위부터). 날짜만으로 정해져 모두에게 같다 */
export function zodiacRanking(day: DayKey): Zodiac[] {
  return seededShuffle(ZODIACS, hashString(`rank|${day}`));
}

export function fortuneFor(birth: Birth, day: DayKey): Fortune {
  const zodiac = zodiacOf(birth.date);
  const rank = zodiacRanking(day).findIndex((z) => z.id === zodiac.id) + 1;
  const tier = TIERS.find((t) => rank <= t.maxRank)!;
  // 운세·조언은 별자리마다 같고, 럭키 아이템·컬러는 생일·태어난 시각으로 나만의 것을 고른다
  const bySign = mulberry32(hashString(`${zodiac.id}|${day}`));
  const mine = mulberry32(hashString(`${birth.date}|${birth.time ?? '-'}|${day}`));
  const pick = <T>(items: readonly T[], random: () => number): T => items[Math.floor(random() * items.length)];
  return {
    zodiac,
    rank,
    rankLabel: tier.label,
    luck: pick(tier.luck, bySign),
    advice: pick(tier.advice, bySign),
    item: pick(ITEMS, mine),
    color: pick(COLORS, mine),
  };
}
