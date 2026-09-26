import { addDays, todayKey as kstTodayKey, type DayKey } from '@/lib/date';
import { missionFor, swapCandidateFor } from '@/lib/progress';
import type { StageNo } from '@/data/stages';
import { createDefaultState } from './adapters';
import type { ChatRole, OngiState, StorageAdapter, StoredMessage } from './types';

const NOTE_MAX = 100;
const BIRD_NAME_MAX = 10;
/** 시연용 과거 기록을 찾을 때 거슬러 올라갈 최대 일수 */
const DEMO_LOOKBACK_DAYS = 3650;

export type OngiStore = {
  getState(): OngiState;
  subscribe(listener: () => void): () => void;
  /** 한국 날짜 기준 오늘 (시연 날짜 이동 포함) */
  todayKey(): DayKey;
  /** dayKey: 화면에 보이던 날짜. 그사이 자정이 지나 오늘이 바뀌었으면 기록하지 않는다 */
  completeMission(input?: { note?: string; dayKey?: DayKey }): { ok: boolean; reason?: 'already-done' | 'day-changed' };
  swapMission(): { ok: boolean };
  appendChatMessage(key: DayKey, question: string, msg: { role: ChatRole; content: string; kind?: 'safety' }): void;
  markBridgeShown(key: DayKey): void;
  renameBird(name: string): { ok: boolean };
  setLastSeenStage(stage: StageNo): void;
  markChatNoticeSeen(): void;
  resetAll(): void;
  demo: {
    setEnabled(on: boolean): void;
    addCompletion(): void;
    shiftDay(delta: number): void;
    resetDay(): void;
    setStageOverride(stage: StageNo | null): void;
  };
};

export function createStore(adapter: StorageAdapter, clock: () => Date = () => new Date()): OngiStore {
  let state = adapter.load() ?? createDefaultState(clock());
  adapter.save(state);
  const listeners = new Set<() => void>();

  function set(next: OngiState) {
    state = next;
    adapter.save(state);
    listeners.forEach((listener) => listener());
  }

  function today(): DayKey {
    return kstTodayKey(clock(), state.settings.dayOffset);
  }

  function updateSettings(patch: Partial<OngiState['settings']>) {
    set({ ...state, settings: { ...state.settings, ...patch } });
  }

  return {
    getState: () => state,

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    todayKey: today,

    completeMission({ note, dayKey } = {}) {
      const key = today();
      if (dayKey && dayKey !== key) return { ok: false, reason: 'day-changed' };
      if (state.missions.records[key]) return { ok: false, reason: 'already-done' };
      const mission = missionFor(state.profile.installId, key, state.missions.swaps[key]);
      const trimmed = note?.trim().slice(0, NOTE_MAX);
      set({
        ...state,
        missions: {
          ...state.missions,
          records: {
            ...state.missions.records,
            [key]: { missionId: mission.id, completedAt: clock().toISOString(), ...(trimmed ? { note: trimmed } : {}) },
          },
        },
      });
      return { ok: true };
    },

    swapMission() {
      const key = today();
      if (state.missions.swaps[key] || state.missions.records[key]) return { ok: false };
      const candidate = swapCandidateFor(state.profile.installId, key);
      set({ ...state, missions: { ...state.missions, swaps: { ...state.missions.swaps, [key]: candidate.id } } });
      return { ok: true };
    },

    appendChatMessage(key, question, { role, content, kind }) {
      const day = state.chats[key] ?? { question, messages: [], bridgeShown: false };
      const message: StoredMessage = { role, content, at: clock().toISOString(), ...(kind ? { kind } : {}) };
      set({ ...state, chats: { ...state.chats, [key]: { ...day, messages: [...day.messages, message] } } });
    },

    markBridgeShown(key) {
      const day = state.chats[key];
      if (!day) return;
      set({ ...state, chats: { ...state.chats, [key]: { ...day, bridgeShown: true } } });
    },

    renameBird(name) {
      const trimmed = name.trim();
      if (trimmed.length < 1 || trimmed.length > BIRD_NAME_MAX) return { ok: false };
      set({ ...state, profile: { ...state.profile, birdName: trimmed } });
      return { ok: true };
    },

    setLastSeenStage(stage) {
      set({ ...state, profile: { ...state.profile, lastSeenStage: stage } });
    },

    markChatNoticeSeen() {
      updateSettings({ seenChatNotice: true });
    },

    resetAll() {
      set(createDefaultState(clock(), state.profile.installId));
    },

    demo: {
      setEnabled(on) {
        updateSettings(on ? { demoMode: true } : { demoMode: false, dayOffset: 0, stageOverride: null });
      },

      addCompletion() {
        const base = today();
        for (let i = 1; i <= DEMO_LOOKBACK_DAYS; i++) {
          const key = addDays(base, -i);
          if (state.missions.records[key]) continue;
          const mission = missionFor(state.profile.installId, key, state.missions.swaps[key]);
          set({
            ...state,
            missions: {
              ...state.missions,
              records: {
                ...state.missions.records,
                [key]: { missionId: mission.id, completedAt: clock().toISOString(), demo: true },
              },
            },
          });
          return;
        }
      },

      shiftDay(delta) {
        updateSettings({ dayOffset: state.settings.dayOffset + delta });
      },

      resetDay() {
        updateSettings({ dayOffset: 0 });
      },

      setStageOverride(stage) {
        updateSettings({ stageOverride: stage });
      },
    },
  };
}
