import { isValidDayKey } from '@/lib/date';
import type { Birth } from '@/lib/fortune';
import { isSongSource } from '@/lib/music/prompt';
import type { AppState, ComposeOutcome, PendingSong, Song, StorageAdapter, TestRecord } from './types';

export const STORAGE_KEY = 'omok:v1';
export const BACKUP_KEY = 'omok:v1:backup';

export function createDefaultState(): AppState {
  return {
    version: 1,
    profile: { nickname: null, birth: null, metOmok: false },
    tests: [],
    songs: [],
    pending: [],
    outcome: null,
  };
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

const isString = (v: unknown): v is string => typeof v === 'string';
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function parseBirth(v: unknown): Birth | null {
  if (!isObject(v) || !isString(v.date) || !isValidDayKey(v.date)) return null;
  return { date: v.date, time: isString(v.time) && TIME.test(v.time) ? v.time : null };
}

function isTestRecord(v: unknown): v is TestRecord {
  return isObject(v) && isString(v.testId) && isString(v.resultId) && isString(v.at);
}

function isMode(v: unknown): v is Song['mode'] {
  return v === 'sample' || v === 'suno';
}

function isSong(v: unknown): v is Song {
  return (
    isObject(v) &&
    isString(v.id) &&
    isString(v.title) &&
    isString(v.audioUrl) &&
    (v.duration === null || typeof v.duration === 'number') &&
    typeof v.temporary === 'boolean' &&
    isMode(v.mode) &&
    isSongSource(v.source) &&
    isString(v.createdAt)
  );
}

function isPending(v: unknown): v is PendingSong {
  return isObject(v) && isString(v.taskId) && isString(v.title) && isSongSource(v.source) && isMode(v.mode) && isString(v.startedAt);
}

function parseOutcome(v: unknown): ComposeOutcome | null {
  if (!isObject(v)) return null;
  if (Array.isArray(v.songIds) && v.songIds.every(isString)) return { songIds: v.songIds };
  if (isString(v.error)) return { error: v.error };
  return null;
}

const listOf = <T>(v: unknown, check: (item: unknown) => item is T): T[] => (Array.isArray(v) ? v.filter(check) : []);

/** 저장된 문자열 → 상태. 뼈대가 망가졌으면 null(백업 후 새로 시작), 잘못된 항목은 그것만 버린다 */
export function parseState(raw: string | null): AppState | null {
  if (raw === null) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isObject(data) || data.version !== 1 || !isObject(data.profile)) return null;
  const { profile } = data;
  return {
    version: 1,
    profile: {
      nickname: isString(profile.nickname) ? profile.nickname : null,
      birth: parseBirth(profile.birth),
      metOmok: profile.metOmok === true,
    },
    tests: listOf(data.tests, isTestRecord),
    songs: listOf(data.songs, isSong),
    pending: listOf(data.pending, isPending),
    outcome: parseOutcome(data.outcome),
  };
}

/** localStorage를 쓸 수 없으면(사생활 보호 모드 등) null */
export function createLocalStorageAdapter(storage?: Storage): StorageAdapter | null {
  let target: Storage | undefined = storage;
  try {
    target ??= globalThis.localStorage;
    if (!target) return null;
    target.setItem('omok:probe', '1');
    target.removeItem('omok:probe');
  } catch {
    return null;
  }
  const s = target;
  return {
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
    subscribe(onChange) {
      // storage 이벤트는 다른 탭이 값을 바꿨을 때만 온다
      const handler = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY) onChange();
      };
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    },
  };
}

/** 저장되지 않는 메모리 어댑터 (localStorage를 못 쓸 때, 테스트) */
export function createMemoryAdapter(initial: AppState | null = null): StorageAdapter {
  let current = initial;
  return {
    load: () => current,
    save(state) {
      current = state;
    },
  };
}
