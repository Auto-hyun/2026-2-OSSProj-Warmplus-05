import { hashString, mulberry32, seededShuffle } from './random';

describe('hashString', () => {
  it('같은 문자열은 항상 같은 값을 준다', () => {
    expect(hashString('abc')).toBe(hashString('abc'));
  });

  it('한 글자만 달라도 다른 값을 준다', () => {
    expect(hashString('abc')).not.toBe(hashString('abd'));
  });

  it('32비트 부호 없는 정수를 준다', () => {
    const h = hashString('온기');
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });
});

describe('mulberry32', () => {
  it('같은 시드면 같은 수열, 값은 [0, 1) 범위다', () => {
    const a = mulberry32(7);
    const b = mulberry32(7);
    for (let i = 0; i < 20; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

describe('seededShuffle', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it('같은 시드면 같은 순서다', () => {
    expect(seededShuffle(items, 42)).toEqual(seededShuffle(items, 42));
  });

  it('원소 집합은 그대로다', () => {
    expect([...seededShuffle(items, 42)].sort((a, b) => a - b)).toEqual(items);
  });

  it('원본 배열을 바꾸지 않는다', () => {
    const copy = [...items];
    seededShuffle(items, 42);
    expect(items).toEqual(copy);
  });

  it('시드가 다르면 순서가 다르다', () => {
    expect(seededShuffle(items, 42)).not.toEqual(seededShuffle(items, 43));
  });
});
