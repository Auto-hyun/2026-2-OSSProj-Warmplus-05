import { describe, expect, it } from 'vitest';
import { FREE_CONTENT_MAX, FREE_TITLE_MAX, mergeWithSamples, parseFreePosts, validateFreePost } from './freeBoard';

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

describe('parseFreePosts', () => {
  it('저장된 글을 내 글로 읽는다 (배경음악은 있으면 함께)', () => {
    const base = { id: 'a', nickname: '수아', title: 't', content: 'c', createdAt: '2026-11-05T00:00:00.000Z' };
    expect(parseFreePosts(JSON.stringify([base]))).toEqual([{ ...base, bgm: null, mine: true }]);
    const bgm = { title: '봄날의 노래', url: '/samples/happy-1.mp3' };
    expect(parseFreePosts(JSON.stringify([{ ...base, bgm }]))[0].bgm).toEqual(bgm);
    expect(parseFreePosts(JSON.stringify([{ ...base, bgm: { title: 1 } }]))[0].bgm).toBeNull();
  });

  it('없거나 깨진 값은 빈 목록, 모양이 다른 항목은 버린다', () => {
    expect(parseFreePosts(null)).toEqual([]);
    expect(parseFreePosts('{깨짐')).toEqual([]);
    expect(parseFreePosts('{"a":1}')).toEqual([]);
    expect(parseFreePosts('[{"id":1}]')).toEqual([]);
  });
});

describe('mergeWithSamples', () => {
  it('내 글과 샘플 글을 최신 글부터 섞는다', () => {
    const now = new Date('2026-11-05T12:00:00.000Z');
    const mine = parseFreePosts(JSON.stringify([{ id: 'a', nickname: '수아', title: 't', content: 'c', createdAt: '2026-11-05T11:59:00.000Z' }]));
    const posts = mergeWithSamples(mine, now);
    expect(posts[0].id).toBe('a');
    expect(posts.length).toBeGreaterThan(1);
    expect(posts.filter((p) => !p.mine).every((p) => p.id.startsWith('sample-'))).toBe(true);
    const times = posts.map((p) => p.createdAt);
    expect([...times].sort().reverse()).toEqual(times);
  });
});
