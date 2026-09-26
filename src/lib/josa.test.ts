import { josa } from './josa';

describe('josa', () => {
  it.each([
    ['콩이', '이/가', '콩이가'],
    ['별', '이/가', '별이'],
    ['뱁새', '과/와', '뱁새와'],
    ['별', '과/와', '별과'],
    ['Coco', '이/가', 'Coco이(가)'],
  ] as const)('%s + %s → %s', (word, pair, expected) => {
    expect(josa(word, pair)).toBe(expected);
  });
});
