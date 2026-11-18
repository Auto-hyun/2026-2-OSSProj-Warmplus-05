import { describe, expect, it } from 'vitest';
import { FREE_CONTENT_MAX, FREE_TITLE_MAX, validateFreePost } from './freeBoard';

const ok = { nickname: '수아', title: '안녕하세요', content: '첫 글이에요' };

describe('validateFreePost', () => {
  it('이름·제목·내용이 있으면 통과', () => {
    expect(validateFreePost(ok)).toBeNull();
  });

  it('빈 칸이나 너무 긴 글은 이유를 알려 준다', () => {
    expect(validateFreePost({ ...ok, nickname: '  ' })).toBe('이름을 적어 주세요.');
    expect(validateFreePost({ ...ok, title: '' })).toBe('제목을 적어 주세요.');
    expect(validateFreePost({ ...ok, content: '\n' })).toBe('내용을 적어 주세요.');
    expect(validateFreePost({ ...ok, title: '가'.repeat(FREE_TITLE_MAX + 1) })).toMatch('제목은');
    expect(validateFreePost({ ...ok, content: '가'.repeat(FREE_CONTENT_MAX + 1) })).toMatch('내용은');
  });
});
