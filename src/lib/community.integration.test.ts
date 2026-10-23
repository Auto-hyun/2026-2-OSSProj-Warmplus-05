// @vitest-environment node
/**
 * 실제 Supabase(로컬 `supabase start`)에 붙여 보는 시험. 평소 `npm test`에서는 건너뛴다.
 * SUPABASE_TEST_URL=http://127.0.0.1:54321 SUPABASE_TEST_KEY=<publishable key> npx vitest run lib/community.integration
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createPost, deletePost, listMyPosts, listPosts } from './community';

const url = process.env.SUPABASE_TEST_URL;
const key = process.env.SUPABASE_TEST_KEY;

const newClient = () => createClient(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } });

describe.skipIf(!url || !key)('커뮤니티 (Supabase 연결)', () => {
  // 건너뛸 때도 describe 본문은 실행되므로, 연결은 시험 직전에 만든다
  let alice: SupabaseClient;
  let bob: SupabaseClient;
  let guest: SupabaseClient;
  beforeAll(() => {
    [alice, bob, guest] = [newClient(), newClient(), newClient()];
  });

  it('익명 계정으로 글을 올리면 다른 사람(로그인 안 한 사람 포함)도 볼 수 있다', async () => {
    const post = await createPost(alice, {
      nickname: '앨리스',
      topic: '오늘 가장 웃겼던 순간은?',
      content: '고양이가 키보드를 밟았어요',
      bgm: { title: '행복의 노래', url: '/samples/happy-1.mp3' },
    });
    expect(post).toMatchObject({ nickname: '앨리스', bgm: { title: '행복의 노래', url: '/samples/happy-1.mp3' } });

    const seen = await listPosts(guest);
    expect(seen.some((p) => p.id === post.id)).toBe(true);
  });

  it('내가 쓴 글만 내 글 목록에 나온다', async () => {
    await createPost(bob, { nickname: '밥', topic: null, content: '밥의 글', bgm: null });
    const alicePosts = await listMyPosts(alice);
    expect(alicePosts.length).toBeGreaterThan(0);
    expect(alicePosts.every((p) => p.nickname === '앨리스')).toBe(true);
    expect(await listMyPosts(guest)).toEqual([]);
  });

  it('남의 글은 지울 수 없고, 내 글은 지울 수 있다', async () => {
    const [mine] = await listMyPosts(alice);
    await deletePost(bob, mine.id); // 정책에 막혀 0건 삭제 (오류 없이 아무 일도 없다)
    expect((await listPosts(guest)).some((p) => p.id === mine.id)).toBe(true);

    await deletePost(alice, mine.id);
    expect((await listPosts(guest)).some((p) => p.id === mine.id)).toBe(false);
  });

  it('로그인 안 한 사람은 글을 쓸 수 없다', async () => {
    const { error } = await guest.from('posts').insert({ nickname: '손님', content: '몰래 쓰기' });
    expect(error).not.toBeNull();
  });

  it('글쓴이를 남으로 바꾸거나, 이상한 배경음악 주소·너무 긴 글은 거절한다', async () => {
    const { data } = await bob.auth.getSession();
    const bobId = data.session!.user.id;
    const asBob = await alice.from('posts').insert({ nickname: '가짜', content: 'x', user_id: bobId });
    expect(asBob.error).not.toBeNull();

    const badUrl = await alice.from('posts').insert({ nickname: '앨리스', content: 'x', bgm_title: 't', bgm_url: 'javascript:alert(1)' });
    expect(badUrl.error).not.toBeNull();

    const tooLong = await alice.from('posts').insert({ nickname: '앨리스', content: '가'.repeat(501) });
    expect(tooLong.error).not.toBeNull();
  });

  it('글은 고칠 수 없다', async () => {
    const post = await createPost(alice, { nickname: '앨리스', topic: null, content: '원래 글', bgm: null });
    await alice.from('posts').update({ content: '고친 글' }).eq('id', post.id);
    const [latest] = await listMyPosts(alice);
    expect(latest.content).toBe('원래 글');
    await deletePost(alice, post.id);
  });
});
