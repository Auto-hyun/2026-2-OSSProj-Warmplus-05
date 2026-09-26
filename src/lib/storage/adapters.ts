import { todayKey } from '@/lib/date';
import type { OngiState, Settings, StorageAdapter } from './types';

export const STORAGE_KEY = 'ongi:v1';
export const BACKUP_KEY = 'ongi:v1:backup';

const DEFAULT_SETTINGS: Settings = {
  demoMode: false,
  dayOffset: 0,
  stageOverride: null,
  seenChatNotice: false,
};

function newInstallId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function createDefaultState(now: Date, installId: string = newInstallId()): OngiState {
  return {
    version: 1,
    profile: { installId, startedOn: todayKey(now), birdName: '뱁새', lastSeenStage: 1 },
    missions: { records: {}, swaps: {} },
    chats: {},
    settings: { ...DEFAULT_SETTINGS },
  };
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** 저장된 문자열 → 상태. 형식이 맞지 않으면 null */
export function parseState(raw: string | null): OngiState | null {
  if (raw === null) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isObject(data) || data.version !== 1) return null;
  const { profile, missions, chats, settings } = data;
  if (!isObject(profile) || typeof profile.installId !== 'string') return null;
  if (!isObject(missions) || !isObject(missions.records) || !isObject(missions.swaps)) return null;
  if (!isObject(chats)) return null;
  return {
    ...(data as unknown as OngiState),
    settings: { ...DEFAULT_SETTINGS, ...(isObject(settings) ? settings : {}) },
  };
}

/** localStorage를 쓸 수 없으면(사생활 보호 모드 등) null */
export function createLocalStorageAdapter(storage?: Storage): StorageAdapter | null {
  let target: Storage | undefined = storage;
  try {
    target ??= globalThis.localStorage;
    if (!target) return null;
    target.setItem('ongi:probe', '1');
    target.removeItem('ongi:probe');
  } catch {
    return null;
  }
  const s = target;
  return {
    persistent: true,
    load() {
      const raw = s.getItem(STORAGE_KEY);
      const state = parseState(raw);
      if (raw !== null && state === null) {
        try {
          s.setItem(BACKUP_KEY, raw);
        } catch {
          // 백업도 못 하면 그대로 기본 상태로 시작한다
        }
      }
      return state;
    },
    save(state) {
      try {
        s.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // 용량 초과 등은 무시: 화면의 상태는 유지된다
      }
    },
  };
}

/** 저장되지 않는 메모리 어댑터 (localStorage를 못 쓸 때) */
export function createMemoryAdapter(initial: OngiState | null = null): StorageAdapter {
  let current = initial;
  return {
    persistent: false,
    load: () => current,
    save(state) {
      current = state;
    },
  };
}
