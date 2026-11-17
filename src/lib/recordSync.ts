import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppStore } from '@/lib/storage/store';
import { deleteAllRecords, diffRecords, EMPTY_RECORDS, hasChanges, mergeRecords, pullRecords, pushChanges, recordsOf } from './records';

/**
 * 카카오 회원으로 로그인해 있는 동안 기기 기록과 계정 기록을 맞춘다.
 * - 이 기기에서 이 계정을 처음 맞추면: 기기 기록(로그인 전 기록 포함)과 계정 기록을 합친다
 * - 이미 맞춘 기기면: 계정 기록을 그대로 따른다 (다른 기기에서 지운 것이 되살아나지 않게)
 * - 그 뒤로는 기기 기록이 바뀔 때마다 바뀐 것만 계정에 올린다. 올리기에 실패하면 다음에 열 때 합쳐서 다시 맞춘다
 */
export const SYNCED_USER_KEY = 'omok:synced-user';
export const SYNC_DIRTY_KEY = 'omok:sync-dirty';

export type SyncStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type RecordSync = {
  /** 이 기기에서 이 계정 기록을 처음 맞췄는지 */
  firstHere: boolean;
  /** 지금까지 바뀐 기록을 계정에 다 올릴 때까지 기다린다 */
  idle(): Promise<void>;
  stop(): void;
  /** 내 기록 지우기: 계정과 이 기기의 계정 기록(프로필·마음 기록·테스트 결과·저장한 노래)을 모두 지운다 */
  deleteAll(): Promise<void>;
};

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

let active: RecordSync | null = null;

/** 지금 맞추고 있는 동기화 (마이페이지의 기록 지우기에서 쓴다) */
export function activeRecordSync(): RecordSync | null {
  return active;
}

export async function startRecordSync(supabase: SupabaseClient, store: AppStore, userId: string, storage: SyncStorage): Promise<RecordSync> {
  const firstHere = storage.getItem(SYNCED_USER_KEY) !== userId;
  const mergeLocal = firstHere || storage.getItem(SYNC_DIRTY_KEY) === '1';
  const remote = await retry(() => pullRecords(supabase));
  store.replaceRecords(mergeLocal ? mergeRecords(recordsOf(store.getState()), remote) : remote);

  let synced = remote;
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
        storage.removeItem(SYNC_DIRTY_KEY);
      } catch {
        storage.setItem(SYNC_DIRTY_KEY, '1');
      }
    });
    return queue;
  };

  await flush();
  storage.setItem(SYNCED_USER_KEY, userId);
  const unsubscribe = store.subscribe(() => void flush());

  const sync: RecordSync = {
    firstHere,
    idle: () => queue,
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
      store.clearRecords();
      storage.removeItem(SYNC_DIRTY_KEY);
    },
  };
  active = sync;
  return sync;
}

/** 내 기록 지우기: 맞추고 있는 동기화가 있으면 그쪽에서, 없으면 계정과 기기 기록을 직접 지운다 */
export async function deleteMyRecords(supabase: SupabaseClient, store: AppStore, userId: string): Promise<void> {
  if (active) return active.deleteAll();
  await deleteAllRecords(supabase, userId);
  store.clearRecords();
}

/** 로그아웃: 이 기기의 계정 기록을 지운다 (계정에는 남아 있어 다시 로그인하면 돌아온다) */
export function forgetSyncedRecords(store: AppStore, storage: SyncStorage): void {
  if (!storage.getItem(SYNCED_USER_KEY)) return;
  active?.stop();
  store.clearRecords();
  storage.removeItem(SYNCED_USER_KEY);
  storage.removeItem(SYNC_DIRTY_KEY);
}
