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
  /** 처음 실행 때 이름 짓기. 이름 없이 부르면(나중에 하기) 기본 이름 그대로 */
  completeNaming(name?: string): { ok: boolean };
  setLastSeenStage(stage: StageNo): void;
  /** 심리테스트 결과 저장 (테스트마다 가장 최근 것만) */
  saveTestResult(testId: string, resultId: string): void;
  /** 온기레터를 오목이 가방에 담는다 (최근 것이 앞, 같은 편지는 한 번만) */
  saveLetter(letterId: number): void;
  /** 처음 방문 시작 화면을 끝까지 봤다 */
  completeIntro(): void;
  /** 카카오 로그인 화면을 지났다 (지금은 화면만. 나중에 Supabase 카카오 로그인이 끝났을 때 부른다) */
  completeLogin(): void;
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

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function set(next: OngiState) {
    state = next;
    adapter.save(state);
    notify();
  }

  // 다른 탭에서 바꾼 기록을 받아온다. 안 그러면 이 탭의 옛 상태로 저장하면서 그 기록을 덮어쓴다
  adapter.subscribe?.(() => {
    const next = adapter.load();
    if (next) {
      state = next;
      notify();
    }
  });

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
      // 글자(코드 포인트) 단위로 잘라 이모지가 반쪽으로 깨지지 않게 한다
      const trimmed = note ? Array.from(note.trim()).slice(0, NOTE_MAX).join('') : undefined;
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

    completeNaming(name) {
      let birdName = state.profile.birdName;
      if (name !== undefined) {
        const trimmed = name.trim();
        if (trimmed.length < 1 || trimmed.length > BIRD_NAME_MAX) return { ok: false };
        birdName = trimmed;
      }
      set({ ...state, profile: { ...state.profile, birdName, named: true } });
      return { ok: true };
    },

    setLastSeenStage(stage) {
      set({ ...state, profile: { ...state.profile, lastSeenStage: stage } });
    },

    saveTestResult(testId, resultId) {
      set({ ...state, tests: { ...state.tests, [testId]: { resultId, at: clock().toISOString() } } });
    },

    saveLetter(letterId) {
      set({ ...state, savedLetters: [letterId, ...state.savedLetters.filter((id) => id !== letterId)] });
    },

    completeIntro() {
      set({ ...state, profile: { ...state.profile, introSeen: true } });
    },

    completeLogin() {
      set({ ...state, profile: { ...state.profile, signedIn: true } });
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
