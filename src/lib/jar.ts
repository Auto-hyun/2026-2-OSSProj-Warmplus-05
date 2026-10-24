import { MOODS, type MoodId } from '@/data/moods';
import type { MoodEntry } from '@/lib/storage/types';

/** 병 하나에 들어가는 구슬 수 (하루 1개, 3주) */
export const JAR_SIZE = 21;

export type Jar = {
  /** 1부터 */
  number: number;
  /** 오래된 것이 앞 */
  entries: MoodEntry[];
  full: boolean;
};

export type JarSummary = {
  number: number;
  from: string;
  to: string;
  days: number;
  /** 감정별 개수, 많은 순 (0개 감정 제외) */
  counts: { mood: MoodId; count: number }[];
  /** 가장 많았던 감정. 같으면 MOODS 순서가 앞선 것 */
  top: MoodId | null;
};

/** 기록(최근 것이 앞)을 날짜 순으로 21개씩 병에 나눈다. 마지막 병이 지금 채우는 병 */
export function splitJars(moods: MoodEntry[]): Jar[] {
  const ordered = [...moods].sort((a, b) => a.day.localeCompare(b.day));
  const jars: Jar[] = [];
  for (let i = 0; i < ordered.length; i += JAR_SIZE) {
    const entries = ordered.slice(i, i + JAR_SIZE);
    jars.push({ number: jars.length + 1, entries, full: entries.length === JAR_SIZE });
  }
  if (jars.length === 0 || jars[jars.length - 1].full) jars.push({ number: jars.length + 1, entries: [], full: false });
  return jars;
}

/** 홈 배경에 놓일 지금 병 */
export function currentJar(moods: MoodEntry[]): Jar {
  const jars = splitJars(moods);
  return jars[jars.length - 1];
}

/** 마이페이지 선반에 올라갈 다 찬 병들 (최근 병이 앞) */
export function fullJars(moods: MoodEntry[]): Jar[] {
  return splitJars(moods)
    .filter((j) => j.full)
    .reverse();
}

/** 홈 기억 선반에 올릴 구슬: 다 찬 병들의 기록, 최근 것부터 slots개 */
export function shelfMoods(moods: MoodEntry[], slots: number): MoodEntry[] {
  return fullJars(moods)
    .flatMap((j) => [...j.entries].reverse())
    .slice(0, slots);
}

export function summarize(jar: Jar): JarSummary {
  const counts = MOODS.map((m) => ({ mood: m.id, count: jar.entries.filter((e) => e.mood === m.id).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
  return {
    number: jar.number,
    from: jar.entries[0]?.day ?? '',
    to: jar.entries[jar.entries.length - 1]?.day ?? '',
    days: jar.entries.length,
    counts,
    top: counts[0]?.mood ?? null,
  };
}
