import { josa, particle } from './josa';

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

describe('particle', () => {
  it('조사만 돌려준다', () => {
    expect(particle('슬픔의 노래', '을/를')).toBe('를');
    expect(particle('오늘의 별', '을/를')).toBe('을');
    expect(particle('Song', '을/를')).toBe('을(를)');
  });
});
