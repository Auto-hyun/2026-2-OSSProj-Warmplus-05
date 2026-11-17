import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppStore } from '@/lib/storage/store';
import type { Records } from '@/lib/storage/types';
import { applyChanges, deleteAllRecords, diffRecords, EMPTY_RECORDS, hasChanges, mergeRecords, pullRecords, pushChanges, recordsOf } from './records';

/**
 * 카카오 회원으로 로그인해 있는 동안 기기 기록과 계정 기록을 맞춘다.
 * - 마지막으로 계정과 맞춘 기록(기준)을 기기에 남겨 둔다. 다시 맞출 때는 계정 기록에, 기준 뒤로 기기에서 바뀐 것만 얹는다.
 *   맞추기가 멈춘 동안 남긴 기록, 올리는 중에 탭을 닫은 기록, 다른 탭의 기록을 잃지 않고, 다른 기기에서 지운 노래는 되살리지 않는다
 * - 처음 맞추는 기기(로그인 전 기록만 있음)는 기기 기록과 계정 기록을 합친다. 다른 회원의 기록이 남은 기기는 섞지 않는다
 * - 그 뒤로는 기록이 바뀔 때마다 바뀐 것만 올린다
 */
export const SYNCED_USER_KEY = 'omok:synced-user';
export const SYNC_BASE_KEY = 'omok:sync-base';

export type SyncStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type RecordSync = {
  /** 이 기기에서 이 계정 기록을 처음 맞췄는지 */
  firstHere: boolean;
  /** 바뀐 기록을 지금 올려 보고, 끝날 때까지 기다린다 */
  idle(): Promise<void>;
  stop(): void;
  /** 내 기록 지우기: 계정과 이 기기의 계정 기록(프로필·마음 기록·테스트 결과·저장한 노래)을 모두 지운다 */
  deleteAll(): Promise<void>;
};

/** 받아 오는 사이 로그아웃이나 계정 전환이 일어나 맞추기를 그만뒀다 (기기에는 아무것도 쓰지 않았다) */
export class SyncCancelled extends Error {
  constructor() {
    super('계정 기록 맞추기를 그만뒀어요.');
  }
}

/** 계정 기록을 맞출 회원 id. 익명 계정(글쓰기용)은 회원이 아니다 */
export function memberIdOf(user: { id: string; is_anonymous?: boolean } | null | undefined): string | null {
  return user && !user.is_anonymous ? user.id : null;
}

/** 잠깐의 오류(네트워크, 방금 받은 로그인 토큰의 시각 차이 등)는 조금 기다렸다 다시 해 본다 */
export async function retry<T>(task: () => Promise<T>, waits: number[] = [500, 1500]): Promise<T> {
  for (const wait of waits) {
    try {
      return await task();
    } catch {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
  return task();
}

/** 마지막으로 계정과 맞춘 기록 (그 회원 것만). 깨져 있으면 없는 것으로 본다 (그러면 합쳐서 다시 맞춘다) */
function readBase(storage: SyncStorage, userId: string): Records | null {
  try {
    const saved = JSON.parse(storage.getItem(SYNC_BASE_KEY) ?? 'null') as { userId?: unknown; records?: Partial<Records> } | null;
    const r = saved?.userId === userId ? saved.records : undefined;
    const ok = r && typeof r.profile === 'object' && r.profile !== null && Array.isArray(r.moods) && Array.isArray(r.tests) && Array.isArray(r.savedSongs);
    return ok ? (r as Records) : null;
  } catch {
    return null;
  }
}

function writeBase(storage: SyncStorage, userId: string, records: Records): void {
  storage.setItem(SYNC_BASE_KEY, JSON.stringify({ userId, records }));
}

/** 이 기기에 아직 계정에 못 올린 기록이 있는지 (기준을 모르면 있다고 본다) */
function hasUnsaved(store: AppStore, storage: SyncStorage, userId: string): boolean {
  const base = readBase(storage, userId);
  return !base || hasChanges(diffRecords(base, recordsOf(store.getState())));
}

let active: RecordSync | null = null;

/** 지금 맞추고 있는 동기화 */
export function activeRecordSync(): RecordSync | null {
  return active;
}

/** isCurrent: 받아 온 뒤에도 아직 이 회원으로 로그인해 있는지 (아니면 아무것도 쓰지 않고 SyncCancelled) */
export async function startRecordSync(
  supabase: SupabaseClient,
  store: AppStore,
  userId: string,
  storage: SyncStorage,
  isCurrent: () => boolean = () => true,
): Promise<RecordSync> {
  const remote = await retry(() => pullRecords(supabase));
  if (!isCurrent()) throw new SyncCancelled();

  // 받아 오는 사이 다른 탭이 기록을 바꿨을 수 있어, 어떻게 맞출지는 받아 온 뒤에 정한다
  const syncedUser = storage.getItem(SYNCED_USER_KEY);
  const local = recordsOf(store.getState());
  const base = syncedUser === userId ? readBase(storage, userId) : null;
  let records: Records;
  if (base) records = applyChanges(remote, diffRecords(base, local));
  else if (syncedUser === null || syncedUser === userId) records = mergeRecords(local, remote);
  else records = remote; // 다른 회원의 기록이 남은 기기
  store.replaceRecords(records);
  storage.setItem(SYNCED_USER_KEY, userId);

  let synced = remote;
  writeBase(storage, userId, synced);
  let stopped = false;
  let queue = Promise.resolve();
  const flush = () => {
    queue = queue.then(async () => {
      if (stopped) return;
      const next = recordsOf(store.getState());
      const changes = diffRecords(synced, next);
      if (!hasChanges(changes)) return;
      try {
        await pushChanges(supabase, userId, changes);
        synced = next;
        writeBase(storage, userId, synced);
      } catch {
        // 기준이 그대로라 다음에 올리거나 다시 맞출 때 함께 올린다
      }
    });
    return queue;
  };

  const unsubscribe = store.subscribe(() => void flush());
  await flush();

  const sync: RecordSync = {
    firstHere: syncedUser !== userId,
    idle: flush,
    stop() {
      stopped = true;
      unsubscribe();
      if (active === sync) active = null;
    },
    async deleteAll() {
      await queue;
      await deleteAllRecords(supabase, userId);
      // 지운 뒤의 기기 기록과 같게 맞춰 두어, 지우면서 바뀐 기록이 다시 올라가지 않게 한다
      synced = EMPTY_RECORDS;
      writeBase(storage, userId, synced);
      store.clearRecords();
    },
  };
  active = sync;
  return sync;
}

/** 내 기록 지우기: 맞추고 있는 동기화가 있으면 그쪽에서, 없으면 계정과 기기 기록을 직접 지운다 */
export async function deleteMyRecords(supabase: SupabaseClient, store: AppStore, userId: string, storage: SyncStorage): Promise<void> {
  if (active) return active.deleteAll();
  await deleteAllRecords(supabase, userId);
  if (storage.getItem(SYNCED_USER_KEY) === userId) writeBase(storage, userId, EMPTY_RECORDS);
  store.clearRecords();
}

/** 로그아웃 전에: 못 올린 기록을 올려 본다. 이 기기의 계정 기록이 모두 계정에 있으면 true */
export async function saveBeforeSignOut(store: AppStore, storage: SyncStorage): Promise<boolean> {
  const userId = storage.getItem(SYNCED_USER_KEY);
  if (!userId) return true;
  await active?.idle();
  return !hasUnsaved(store, storage, userId);
}

/**
 * 로그아웃: 이 기기의 계정 기록을 지운다 (계정에 있어 다시 로그인하면 돌아온다).
 * 아직 계정에 못 올린 기록이 있으면 지우지 않고 false (다시 로그인하면 이어서 올린다). force면 그래도 지운다
 */
export function forgetSyncedRecords(store: AppStore, storage: SyncStorage, options: { force?: boolean } = {}): boolean {
  const userId = storage.getItem(SYNCED_USER_KEY);
  if (!userId) return true;
  active?.stop();
  if (!options.force && hasUnsaved(store, storage, userId)) return false;
  store.clearRecords();
  storage.removeItem(SYNCED_USER_KEY);
  storage.removeItem(SYNC_BASE_KEY);
  return true;
}
