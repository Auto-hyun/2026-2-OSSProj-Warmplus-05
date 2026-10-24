import { isCrisis } from './safety';

describe('위기 표현 감지', () => {
  it('위기 표현을 찾는다', () => {
    expect(isCrisis('요즘 그냥 죽고 싶어')).toBe(true);
    expect(isCrisis('다 사라지고싶다')).toBe(true);
  });
  it('일상 표현은 넘긴다', () => {
    expect(isCrisis('배고파 죽겠어')).toBe(false);
    expect(isCrisis('오늘 좀 지쳤어')).toBe(false);
  });
});
