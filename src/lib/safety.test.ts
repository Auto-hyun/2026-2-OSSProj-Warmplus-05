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
  ])('"%s" → 감지', (text) => {
    expect(detectCrisis(text)).toBe(true);
  });

  it.each(['배고파 죽겠다', '피곤해 죽겠어', '유서 깊은 동네에 다녀왔어', '일을 빨리 끝내고 싶어', '오늘 좋은 일이 있었어요', ''])(
    '"%s" → 감지 안 함',
    (text) => {
      expect(detectCrisis(text)).toBe(false);
    },
  );

  it('안내 문구는 전문가 연락을 권한다', () => {
    expect(SAFETY_MESSAGE).toContain('전문가');
  });
});
