// @vitest-environment node
/**
 * 실제 Supabase(로컬 `supabase start`)에 붙여 보는 자유게시판 시험. 평소 `npm test`에서는 건너뛴다.
 * SUPABASE_TEST_URL=http://127.0.0.1:54321 SUPABASE_TEST_KEY=<publishable key> npx vitest run lib/freeBoard.integration
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createFreePost, deleteFreePost, listFreePosts, listMyFreePosts } from './freeBoard';

const url = process.env.SUPABASE_TEST_URL;
const key = process.env.SUPABASE_TEST_KEY;

const newClient = () => createClient(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } });

describe.skipIf(!url || !key)('자유게시판 (Supabase 연결)', () => {
  // 건너뛸 때도 describe 본문은 실행되므로, 연결은 시험 직전에 만든다
  let alice: SupabaseClient;
  let bob: SupabaseClient;
  let guest: SupabaseClient;
  beforeAll(() => {
    [alice, bob, guest] = [newClient(), newClient(), newClient()];
  });

  it('로그인 없이(익명 계정으로) 올린 글을 로그인 안 한 사람도 본다', async () => {
    const post = await createFreePost(alice, {
      nickname: ' 앨리스 ',
      title: ' 시험 끝났어요 ',
      content: ' 오늘은 푹 쉬려고요 ',
      bgm: { title: '행복의 노래', url: '/samples/happy-3.mp3' },
    });
    expect(post).toMatchObject({ nickname: '앨리스', title: '시험 끝났어요', content: '오늘은 푹 쉬려고요', bgm: { title: '행복의 노래', url: '/samples/happy-3.mp3' } });

    const seen = await listFreePosts(guest);
    expect(seen.find((p) => p.id === post.id)).toMatchObject({ title: '시험 끝났어요', userId: post.userId });
  });

  it('내가 쓴 글만 내 글 목록에 나온다', async () => {
    await createFreePost(bob, { nickname: '밥', title: '밥의 글', content: '안녕' });
    const mine = await listMyFreePosts(alice);
    expect(mine.length).toBeGreaterThan(0);
    expect(mine.every((p) => p.nickname === '앨리스')).toBe(true);
    expect(await listMyFreePosts(guest)).toEqual([]);
  });

  it('남의 글은 지울 수 없고, 내 글은 지울 수 있다', async () => {
    const [mine] = await listMyFreePosts(alice);
    await deleteFreePost(bob, mine.id);
    expect((await listFreePosts(guest)).some((p) => p.id === mine.id)).toBe(true);

    await deleteFreePost(alice, mine.id);
    expect((await listFreePosts(guest)).some((p) => p.id === mine.id)).toBe(false);
  });

  it('더 보기: 기준 시각보다 오래된 글만 준다', async () => {
    const first = await createFreePost(bob, { nickname: '밥', title: '먼저 쓴 글', content: '1' });
    const second = await createFreePost(bob, { nickname: '밥', title: '나중 쓴 글', content: '2' });
    const older = await listFreePosts(guest, second.createdAt);
    expect(older.some((p) => p.id === second.id)).toBe(false);
    expect(older.some((p) => p.id === first.id)).toBe(true);
  });

  it('올릴 수 없는 글은 서버에 보내기 전에 이유를 알려 준다', async () => {
    await expect(createFreePost(bob, { nickname: '밥', title: '   ', content: '내용' })).rejects.toThrow('제목을 적어 주세요.');
  });
});
