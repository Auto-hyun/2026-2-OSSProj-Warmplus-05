import { SAFETY_MESSAGE, detectCrisis } from './safety';

describe('detectCrisis (위기 표현 감지)', () => {
  it.each([
    '죽고 싶어요',
    '요즘 죽고싶다는 생각이 들어',
    '자해를 했어',
    '그냥 사라지고 싶어',
    '살기 싫어',
    '극단적 선택을 생각했어',
    '다 없어지고 싶다',
    '살고 싶지 않아',
    '그만 살고 싶어',
    '살고 싶지가 않아',
    '살고 싶지도 않아',
    '죽어버릴까',
    '차라리 죽을까 생각했어',
    '죽고… 싶다',
    '그냥 사라져 버리고 싶어',
    '살아서 뭐해',
    '살 이유가 없어',
  ])('"%s" → 감지', (text) => {
    expect(detectCrisis(text)).toBe(true);
  });

  it.each([
    '배고파 죽겠다',
    '피곤해 죽겠어',
    '유서 깊은 동네에 다녀왔어',
    '일을 빨리 끝내고 싶어',
    '오늘 좋은 일이 있었어요',
    '살고 싶은 동네가 생겼어',
    '그만 먹고 싶어',
    '죽을 만큼 웃었어',
    '',
  ])(
    '"%s" → 감지 안 함',
    (text) => {
      expect(detectCrisis(text)).toBe(false);
    },
  );

  it('안내 문구는 전문가 연락을 권한다', () => {
    expect(SAFETY_MESSAGE).toContain('전문가');
  });
});

describe('SAFETY_MESSAGE', () => {
  it('사용자가 이름을 바꿀 수 있으므로 스스로를 "오목이"·"뱁새"라고 부르지 않는다', () => {
    expect(SAFETY_MESSAGE).not.toMatch(/오목이|뱁새/);
  });
});
