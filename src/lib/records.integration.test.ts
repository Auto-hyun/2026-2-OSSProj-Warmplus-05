// @vitest-environment node
/**
 * 실제 Supabase(로컬 `supabase start`)에 붙여 보는 계정 기록 시험. 평소 `npm test`에서는 건너뛴다.
 * 카카오 회원 대신 이메일로 가입한 회원(익명이 아닌 계정)을 쓴다.
 * SUPABASE_TEST_URL=http://127.0.0.1:54321 SUPABASE_TEST_KEY=<publishable key> npx vitest run lib/records.integration
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Records } from '@/lib/storage/types';
import { deleteAllRecords, diffRecords, EMPTY_RECORDS, pullRecords, pushChanges } from './records';

const url = process.env.SUPABASE_TEST_URL;
const key = process.env.SUPABASE_TEST_KEY;

const newClient = () => createClient(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } });

async function member(): Promise<{ client: SupabaseClient; id: string }> {
  const client = newClient();
  const { data, error } = await client.auth.signUp({ email: `records-${crypto.randomUUID()}@example.com`, password: 'password-1234' });
  if (error || !data.user) throw error ?? new Error('가입 실패');
  return { client, id: data.user.id };
}

const records: Records = {
  profile: { nickname: '앨리스', birth: { date: '2003-02-01', time: '07:30' } },
  moods: [
    { day: '2026-11-17', mood: 'sad', source: 'test', testId: 'mind-sound', at: '2026-11-17T10:00:00.000Z' },
    { day: '2026-11-16', mood: 'joy', source: 'daily', note: '산책', at: '2026-11-16T09:30:00.000Z' },
  ],
  tests: [{ testId: 'mind-sound', resultId: 'c', at: '2026-11-17T10:00:00.000Z' }],
  savedSongs: [
    {
      id: 'sample-sad-1794907078193-1',
      title: '밤의 노래',
      audioUrl: '/samples/sad-3.mp3',
      duration: 129.16,
      temporary: false,
      mode: 'sample',
      source: { kind: 'test', testId: 'mind-sound', resultId: 'c' },
      createdAt: '2026-11-17T10:05:00.000Z',
      saved: true,
    },
    {
      id: 'sample-happy-1794907078000-2',
      title: '행복의 노래 #2',
      audioUrl: '/samples/happy-5.mp3',
      duration: null,
      temporary: false,
      mode: 'sample',
      source: { kind: 'words', words: ['happy', 'thankful'] },
      createdAt: '2026-11-16T10:05:00.000Z',
      saved: true,
    },
  ],
};

describe.skipIf(!url || !key)('계정 기록 (Supabase 연결)', () => {
  it('회원은 기록을 올리고 그대로 다시 받아 온다', async () => {
    const alice = await member();
    await pushChanges(alice.client, alice.id, diffRecords(EMPTY_RECORDS, records));
    expect(await pullRecords(alice.client)).toEqual(records);
  });

  it('이름 바꾸기·저장 취소·다시 기록한 기분처럼 바뀐 것만 올려도 계정에 반영된다', async () => {
    const alice = await member();
    await pushChanges(alice.client, alice.id, diffRecords(EMPTY_RECORDS, records));
    const after: Records = {
      ...records,
      moods: [{ ...records.moods[0], mood: 'calm', at: '2026-11-17T11:00:00.000Z' }, records.moods[1]],
      savedSongs: [{ ...records.savedSongs[0], title: '새벽의 노래' }],
    };
    await pushChanges(alice.client, alice.id, diffRecords(records, after));
    expect(await pullRecords(alice.client)).toEqual(after);
  });

  it('다른 회원의 기록은 받아 오지 않는다', async () => {
    const [alice, bob] = await Promise.all([member(), member()]);
    await pushChanges(alice.client, alice.id, diffRecords(EMPTY_RECORDS, records));
    expect(await pullRecords(bob.client)).toEqual(EMPTY_RECORDS);
  });

  it('익명 계정은 계정 기록을 올릴 수 없다', async () => {
    const guest = newClient();
    const { data } = await guest.auth.signInAnonymously();
    await expect(pushChanges(guest, data.user!.id, diffRecords(EMPTY_RECORDS, records))).rejects.toThrow();
  });

  it('기록 지우기: 계정 기록이 모두 사라진다', async () => {
    const alice = await member();
    await pushChanges(alice.client, alice.id, diffRecords(EMPTY_RECORDS, records));
    await deleteAllRecords(alice.client, alice.id);
    expect(await pullRecords(alice.client)).toEqual(EMPTY_RECORDS);
  });
});
