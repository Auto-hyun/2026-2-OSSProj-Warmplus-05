// @vitest-environment node
/**
 * 기기 ↔ 계정 기록 맞추기를 실제 Supabase(로컬 `supabase start`)로 시험한다. 평소 `npm test`에서는 건너뛴다.
 * 기기는 메모리 저장소로 흉내 내고, 카카오 회원 대신 이메일로 가입한 회원을 쓴다.
 * SUPABASE_TEST_URL=http://127.0.0.1:54321 SUPABASE_TEST_KEY=<publishable key> npx vitest run lib/recordSync
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createMemoryAdapter } from '@/lib/storage/adapters';
import { createStore, type AppStore } from '@/lib/storage/store';
import { EMPTY_RECORDS, pullRecords } from './records';
import { deleteMyRecords, forgetSyncedRecords, memberIdOf, startRecordSync, SYNCED_USER_KEY, type SyncStorage } from './recordSync';

const url = process.env.SUPABASE_TEST_URL;
const key = process.env.SUPABASE_TEST_KEY;

async function member(): Promise<{ client: SupabaseClient; id: string }> {
  const client = createClient(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.signUp({ email: `sync-${crypto.randomUUID()}@example.com`, password: 'password-1234' });
  if (error || !data.user) throw error ?? new Error('가입 실패');
  return { client, id: data.user.id };
}

function memoryStorage(): SyncStorage {
  const items = new Map<string, string>();
  return { getItem: (k) => items.get(k) ?? null, setItem: (k, v) => void items.set(k, v), removeItem: (k) => void items.delete(k) };
}

/** 기기 하나: 기기 기록 + 동기화 표시를 남기는 저장소 */
const device = (now = '2026-11-17T10:00:00Z') => ({ store: createStore(createMemoryAdapter(), () => new Date(now)), storage: memoryStorage() });

/** 노래 한 번 만들어 첫 곡을 저장한다 */
function makeAndSave(store: AppStore, id: string) {
  store.addPending({ taskId: id, title: '슬픔의 노래', source: { kind: 'words', words: ['sadness'] }, mode: 'sample' });
  store.completePending(id, [
    { id: `${id}-1`, audioUrl: '/samples/sad-1.mp3', duration: null, temporary: false },
    { id: `${id}-2`, audioUrl: '/samples/sad-2.mp3', duration: null, temporary: false },
  ]);
  store.setSongSaved(`${id}-1`, true);
}

const savedIds = (store: AppStore) => store.getState().songs.filter((s) => s.saved).map((s) => s.id);

describe.skipIf(!url || !key)('기기 ↔ 계정 기록 맞추기', () => {
  it('처음 로그인한 기기: 기기 기록을 계정에 합치고, 계정 기록도 기기로 가져온다', async () => {
    const alice = await member();
    const phone = device('2026-11-16T10:00:00Z');
    phone.store.recordMood('joy');
    const first = await startRecordSync(alice.client, phone.store, alice.id, phone.storage);
    await first.idle();
    first.stop();

    const laptop = device('2026-11-17T10:00:00Z');
    laptop.store.recordMood('sad');
    laptop.store.saveTestResult('mind-sound', 'c');
    const sync = await startRecordSync(alice.client, laptop.store, alice.id, laptop.storage);
    await sync.idle();

    expect(sync.firstHere).toBe(true);
    expect(laptop.store.getState().moods.map((m) => `${m.day} ${m.mood}`)).toEqual(['2026-11-17 sad', '2026-11-16 joy']);
    const remote = await pullRecords(alice.client);
    expect(remote.moods.map((m) => m.day)).toEqual(['2026-11-17', '2026-11-16']);
    expect(remote.tests).toHaveLength(1);
    expect(laptop.storage.getItem(SYNCED_USER_KEY)).toBe(alice.id);
    sync.stop();
  });

  it('로그인해 있는 동안 바뀐 기록은 바로 계정에 저장된다 (저장한 노래만)', async () => {
    const alice = await member();
    const d = device();
    const sync = await startRecordSync(alice.client, d.store, alice.id, d.storage);
    d.store.setNickname('앨리스');
    makeAndSave(d.store, 'task-a');
    await sync.idle();

    const remote = await pullRecords(alice.client);
    expect(remote.profile.nickname).toBe('앨리스');
    expect(remote.savedSongs.map((s) => s.id)).toEqual(['task-a-1']);

    d.store.setSongSaved('task-a-1', false);
    await sync.idle();
    expect((await pullRecords(alice.client)).savedSongs).toEqual([]);
    sync.stop();
  });

  it('이미 맞춘 기기는 계정 기록을 따른다 (다른 기기에서 저장 취소한 노래가 되살아나지 않는다)', async () => {
    const alice = await member();
    const [a, b] = [device(), device()];
    const syncA = await startRecordSync(alice.client, a.store, alice.id, a.storage);
    makeAndSave(a.store, 'task-x');
    await syncA.idle();

    const syncB = await startRecordSync(alice.client, b.store, alice.id, b.storage);
    await syncB.idle();
    syncB.stop();
    expect(savedIds(b.store)).toEqual(['task-x-1']);

    a.store.setSongSaved('task-x-1', false);
    await syncA.idle();
    syncA.stop();

    const again = await startRecordSync(alice.client, b.store, alice.id, b.storage);
    await again.idle();
    expect(again.firstHere).toBe(false);
    expect(savedIds(b.store)).toEqual([]);
    again.stop();
  });

  it('내 기록 지우기: 계정과 이 기기의 계정 기록이 모두 사라진다', async () => {
    const alice = await member();
    const d = device();
    d.store.setNickname('앨리스');
    d.store.recordMood('sad');
    const sync = await startRecordSync(alice.client, d.store, alice.id, d.storage);
    await sync.idle();

    await sync.deleteAll();
    await sync.idle();
    expect(await pullRecords(alice.client)).toEqual(EMPTY_RECORDS);
    expect(d.store.getState().moods).toEqual([]);
    expect(d.store.getState().profile.nickname).toBeNull();
    sync.stop();
  });

  it('맞추고 있는 동기화가 없어도 내 기록 지우기가 된다', async () => {
    const alice = await member();
    const d = device();
    d.store.recordMood('sad');
    const sync = await startRecordSync(alice.client, d.store, alice.id, d.storage);
    await sync.idle();
    sync.stop();

    await deleteMyRecords(alice.client, d.store, alice.id);
    expect(await pullRecords(alice.client)).toEqual(EMPTY_RECORDS);
    expect(d.store.getState().moods).toEqual([]);
  });

  it('로그아웃하면 이 기기의 계정 기록을 지우고, 다시 로그인하면 계정에서 돌아온다', async () => {
    const alice = await member();
    const d = device();
    d.store.recordMood('sad');
    const sync = await startRecordSync(alice.client, d.store, alice.id, d.storage);
    await sync.idle();

    forgetSyncedRecords(d.store, d.storage);
    expect(d.store.getState().moods).toEqual([]);
    expect(d.storage.getItem(SYNCED_USER_KEY)).toBeNull();

    const again = await startRecordSync(alice.client, d.store, alice.id, d.storage);
    await again.idle();
    expect(d.store.getState().moods.map((m) => m.mood)).toEqual(['sad']);
    again.stop();
  });
});

describe('memberIdOf', () => {
  it('익명이 아닌 계정(카카오)만 회원으로 본다', () => {
    expect(memberIdOf({ id: 'u1', is_anonymous: false })).toBe('u1');
    expect(memberIdOf({ id: 'u2', is_anonymous: true })).toBeNull();
    expect(memberIdOf(null)).toBeNull();
  });
});
