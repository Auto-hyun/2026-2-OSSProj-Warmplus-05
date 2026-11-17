import { existsSync } from 'node:fs';
import { pickTwo, SAMPLE_POOLS } from './sample';

/** 작업 번호에 들어가는 시작 시각(ms)처럼 생긴 값들 */
const seeds = Array.from({ length: 1000 }, (_, i) => 1_760_000_000_000 + i * 7919);

describe('pickTwo (곡 풀에서 두 곡 고르기)', () => {
  it('곡 풀에서 서로 다른 두 곡을 고른다', () => {
    for (const seed of seeds) {
      const [a, b] = pickTwo(12, seed);
      expect(a).not.toBe(b);
      for (const n of [a, b]) {
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(12);
      }
    }
  });

  it('작업마다 고르는 곡이 달라서 풀의 모든 곡이 나온다', () => {
    const picked = new Set(seeds.flatMap((seed) => pickTwo(12, seed)));
    expect([...picked].sort((x, y) => x - y)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
});

describe('샘플 곡 파일', () => {
  it('곡 풀마다 적어 둔 곡 수만큼 public/samples에 파일이 있다', () => {
    for (const [pool, count] of Object.entries(SAMPLE_POOLS)) {
      // 작곡 한 번에 서로 다른 2곡을 돌려주므로 풀마다 2곡 이상
      expect(count, `${pool} 곡 수`).toBeGreaterThanOrEqual(2);
      for (let n = 1; n <= count; n++) expect(existsSync(`public/samples/${pool}-${n}.mp3`), `${pool}-${n}.mp3`).toBe(true);
      expect(existsSync(`public/samples/${pool}-${count + 1}.mp3`), `${pool}-${count + 1}.mp3가 있는데 쓰이지 않는다`).toBe(false);
    }
  });
});
