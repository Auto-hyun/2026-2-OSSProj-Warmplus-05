// @vitest-environment node
/**
 * 20261117000000_user_records.sql 테이블들의 접근 규칙(RLS) 시험. 평소 `npm test`에서는 건너뛴다.
 * 로컬 `supabase start` 뒤:
 * SUPABASE_TEST_URL=http://127.0.0.1:54321 SUPABASE_TEST_KEY=<publishable key> npx vitest run supabase/rls
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_TEST_URL;
const key = process.env.SUPABASE_TEST_KEY;

const newClient = () => createClient(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } });

/** 카카오 회원 대신 이메일로 가입한 회원 (익명이 아닌 계정) */
async function member(): Promise<{ client: SupabaseClient; id: string }> {
  const client = newClient();
  const { data, error } = await client.auth.signUp({ email: `rls-${crypto.randomUUID()}@example.com`, password: 'password-1234' });
  if (error || !data.user) throw error ?? new Error('가입 실패');
  return { client, id: data.user.id };
}

async function anonymous(): Promise<{ client: SupabaseClient; id: string }> {
  const client = newClient();
  const { data, error } = await client.auth.signInAnonymously();
  if (error || !data.user) throw error ?? new Error('익명 로그인 실패');
  return { client, id: data.user.id };
}

const mood = (userId: string) => ({ user_id: userId, day: '2026-11-17', mood: 'sad', source: 'daily', at: '2026-11-17T10:00:00.000Z' });

describe.skipIf(!url || !key)('계정 기록 테이블 접근 규칙', () => {
  it('회원은 내 기록을 쓰고 읽고, 다른 회원은 볼 수 없다', async () => {
    const [alice, bob] = await Promise.all([member(), member()]);
    expect((await alice.client.from('mood_entries').insert(mood(alice.id))).error).toBeNull();
    expect((await alice.client.from('test_results').insert({ user_id: alice.id, test_id: 'mind-sound', result_id: 'c', at: '2026-11-17T10:00:00.000Z' })).error).toBeNull();
    expect((await alice.client.from('profiles').upsert({ user_id: alice.id, nickname: '앨리스', birth_date: '2003-02-01', birth_time: null })).error).toBeNull();

    expect((await alice.client.from('mood_entries').select('day, mood')).data).toEqual([{ day: '2026-11-17', mood: 'sad' }]);
    expect((await alice.client.from('profiles').select('nickname')).data).toEqual([{ nickname: '앨리스' }]);
    expect((await bob.client.from('mood_entries').select('day')).data).toEqual([]);
    expect((await bob.client.from('profiles').select('nickname')).data).toEqual([]);
  });

  it('남의 계정 이름으로는 쓸 수 없다', async () => {
    const [alice, bob] = await Promise.all([member(), member()]);
    expect((await bob.client.from('mood_entries').insert(mood(alice.id))).error).not.toBeNull();
  });

  it('익명 계정은 계정 기록을 남길 수 없다', async () => {
    const guest = await anonymous();
    expect((await guest.client.from('mood_entries').insert(mood(guest.id))).error).not.toBeNull();
    expect((await guest.client.from('profiles').upsert({ user_id: guest.id, nickname: '손님' })).error).not.toBeNull();
  });

  it('로그인하지 않은 사람은 계정 기록을 읽지 못한다', async () => {
    const { data, error } = await newClient().from('mood_entries').select('day');
    expect(error !== null || data?.length === 0).toBe(true);
  });

  it('저장한 노래는 앱 곡 주소나 https 주소만 받는다', async () => {
    const alice = await member();
    const song = { user_id: alice.id, title: '밤의 노래', mode: 'sample', source: { kind: 'words', words: ['sadness'] }, created_at: '2026-11-17T10:00:00.000Z' };
    expect((await alice.client.from('saved_songs').insert({ ...song, id: 'a', audio_url: '/samples/sad-3.mp3' })).error).toBeNull();
    expect((await alice.client.from('saved_songs').insert({ ...song, id: 'b', audio_url: 'javascript:alert(1)' })).error).not.toBeNull();
  });

  it('자유게시판: 익명 계정도 쓰고, 누구나 읽고, 내 글만 지운다', async () => {
    const [writer, other] = await Promise.all([anonymous(), anonymous()]);
    const { data: post, error } = await writer.client
      .from('free_posts')
      .insert({ nickname: '쓰니', title: '안녕하세요', content: '첫 글이에요' })
      .select('id')
      .single();
    expect(error).toBeNull();

    const seen = await newClient().from('free_posts').select('id').eq('id', post!.id);
    expect(seen.data).toEqual([{ id: post!.id }]);

    await other.client.from('free_posts').delete().eq('id', post!.id);
    expect((await newClient().from('free_posts').select('id').eq('id', post!.id)).data).toHaveLength(1);

    await writer.client.from('free_posts').delete().eq('id', post!.id);
    expect((await newClient().from('free_posts').select('id').eq('id', post!.id)).data).toHaveLength(0);
  });

  it('이용 기록: 누구나 남길 수 있지만 읽지는 못한다', async () => {
    const guest = newClient();
    const deviceId = crypto.randomUUID();
    expect((await guest.from('events').insert({ device_id: deviceId, name: 'page_view', props: { path: '/' } })).error).toBeNull();
    expect((await guest.from('events').insert({ device_id: deviceId, name: 'unknown_event' })).error).not.toBeNull();
    const { data, error } = await guest.from('events').select('id');
    expect(error !== null || data?.length === 0).toBe(true);
  });
});
