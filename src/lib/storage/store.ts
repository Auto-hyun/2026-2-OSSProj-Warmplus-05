import type { Birth } from '@/lib/fortune';
import type { Track } from '@/lib/music/types';
import { createDefaultState } from './adapters';
import type { AppState, PendingSong, StorageAdapter } from './types';

export const NICKNAME_MAX = 12;

export type AppStore = {
  getState(): AppState;
  subscribe(listener: () => void): () => void;
  /** 1~12자. 앞뒤 공백은 지운다 */
  setNickname(name: string): { ok: boolean };
  setBirth(birth: Birth | null): void;
  meetOmok(): void;
  saveTestResult(testId: string, resultId: string): void;
  addPending(pending: Omit<PendingSong, 'startedAt'>): void;
  /** 작곡 완료: 곡들을 내 노래에 넣고 결과로 보여 준다 */
  completePending(taskId: string, tracks: Track[]): void;
  failPending(taskId: string, reason: string): void;
  dismissOutcome(): void;
  removeSong(id: string): void;
};

export function createStore(adapter: StorageAdapter, clock: () => Date = () => new Date()): AppStore {
  let state = adapter.load() ?? createDefaultState();
  const listeners = new Set<() => void>();

  function set(next: AppState) {
    state = next;
    adapter.save(state);
    listeners.forEach((listener) => listener());
  }

  // 다른 탭에서 바꾼 기록을 받아온다. 안 그러면 이 탭의 옛 상태로 저장하면서 그 기록을 덮어쓴다
  adapter.subscribe?.(() => {
    const next = adapter.load();
    if (next) {
      state = next;
      listeners.forEach((listener) => listener());
    }
  });

  const now = () => clock().toISOString();

  return {
    getState: () => state,

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    setNickname(name) {
      const trimmed = name.trim();
      const length = Array.from(trimmed).length;
      if (length < 1 || length > NICKNAME_MAX) return { ok: false };
      set({ ...state, profile: { ...state.profile, nickname: trimmed } });
      return { ok: true };
    },

    setBirth(birth) {
      set({ ...state, profile: { ...state.profile, birth } });
    },

    meetOmok() {
      if (!state.profile.metOmok) set({ ...state, profile: { ...state.profile, metOmok: true } });
    },

    saveTestResult(testId, resultId) {
      set({ ...state, tests: [{ testId, resultId, at: now() }, ...state.tests] });
    },

    addPending(pending) {
      set({ ...state, pending: [...state.pending, { ...pending, startedAt: now() }], outcome: null });
    },

    completePending(taskId, tracks) {
      const pending = state.pending.find((p) => p.taskId === taskId);
      if (!pending) return;
      const createdAt = now();
      const songs = tracks.map((t, i) => ({
        id: t.id,
        // 한 번에 2곡이 나와서 두 번째부터 번호를 붙인다
        title: i === 0 ? pending.title : `${pending.title} #${i + 1}`,
        audioUrl: t.audioUrl,
        duration: t.duration,
        temporary: t.temporary,
        mode: pending.mode,
        source: pending.source,
        createdAt,
      }));
      const fresh = songs.filter((s) => !state.songs.some((old) => old.id === s.id));
      set({
        ...state,
        songs: [...fresh, ...state.songs],
        pending: state.pending.filter((p) => p.taskId !== taskId),
        outcome: { songIds: songs.map((s) => s.id) },
      });
    },

    failPending(taskId, reason) {
      if (!state.pending.some((p) => p.taskId === taskId)) return;
      set({ ...state, pending: state.pending.filter((p) => p.taskId !== taskId), outcome: { error: reason } });
    },

    dismissOutcome() {
      set({ ...state, outcome: null });
    },

    removeSong(id) {
      set({ ...state, songs: state.songs.filter((s) => s.id !== id) });
    },
  };
}
