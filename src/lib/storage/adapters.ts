import { STAGES, type StageNo } from '@/data/stages';
import { isValidDayKey, todayKey, type DayKey } from '@/lib/date';
import type { ChatDay, MissionRecord, OngiState, Settings, StorageAdapter, StoredMessage } from './types';

export const STORAGE_KEY = 'ongi:v1';
export const BACKUP_KEY = 'ongi:v1:backup';
export const DEFAULT_BIRD_NAME = '뱁새';

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
    profile: { installId, startedOn: todayKey(now), birdName: DEFAULT_BIRD_NAME, named: false, lastSeenStage: 1 },
    missions: { records: {}, swaps: {} },
    chats: {},
    settings: { ...DEFAULT_SETTINGS },
  };
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isStageNo(v: unknown): v is StageNo {
  return STAGES.some((stage) => stage.no === v);
}

/** 날짜 키가 올바르고 값이 모양에 맞는 항목만 남긴다 */
function pickDays<T>(data: Record<string, unknown>, parse: (value: unknown) => T | null): Record<DayKey, T> {
  const out: Record<DayKey, T> = {};
  for (const [key, value] of Object.entries(data)) {
    const parsed = isValidDayKey(key) ? parse(value) : null;
    if (parsed !== null) out[key] = parsed;
  }
  return out;
}

function parseRecord(v: unknown): MissionRecord | null {
  if (!isObject(v) || typeof v.missionId !== 'string' || typeof v.completedAt !== 'string') return null;
  if ((v.note !== undefined && typeof v.note !== 'string') || (v.demo !== undefined && typeof v.demo !== 'boolean')) return null;
  return v as MissionRecord;
}

function isMessage(v: unknown): v is StoredMessage {
  return (
    isObject(v) &&
    (v.role === 'user' || v.role === 'assistant') &&
    typeof v.content === 'string' &&
    typeof v.at === 'string' &&
    (v.kind === undefined || v.kind === 'safety')
  );
}

function parseChatDay(v: unknown): ChatDay | null {
  if (!isObject(v) || typeof v.question !== 'string' || typeof v.bridgeShown !== 'boolean') return null;
  if (!Array.isArray(v.messages) || !v.messages.every(isMessage)) return null;
  return v as ChatDay;
}

/** 잘못된 설정 값은 그 값만 기본값으로 (예전 데이터에 없는 값도 채워진다) */
function parseSettings(v: unknown): Settings {
  const s = isObject(v) ? v : {};
  return {
    demoMode: typeof s.demoMode === 'boolean' ? s.demoMode : DEFAULT_SETTINGS.demoMode,
    dayOffset: Number.isInteger(s.dayOffset) ? (s.dayOffset as number) : DEFAULT_SETTINGS.dayOffset,
    stageOverride: isStageNo(s.stageOverride) ? s.stageOverride : DEFAULT_SETTINGS.stageOverride,
    seenChatNotice: typeof s.seenChatNotice === 'boolean' ? s.seenChatNotice : DEFAULT_SETTINGS.seenChatNotice,
  };
}

/**
 * 저장된 문자열 → 상태. 뼈대나 프로필이 망가졌으면 null(백업 후 새로 시작),
 * 잘못된 기록·대화·설정은 그 항목만 버리거나 기본값으로 되돌린다.
 */
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
  if (!isObject(profile) || !isObject(missions) || !isObject(missions.records) || !isObject(missions.swaps)) return null;
  if (!isObject(chats)) return null;

  const { installId, startedOn, birdName, lastSeenStage } = profile;
  if (typeof installId !== 'string' || typeof startedOn !== 'string' || !isValidDayKey(startedOn)) return null;
  if (typeof birdName !== 'string' || !isStageNo(lastSeenStage)) return null;

  const records = pickDays(missions.records, parseRecord);
  const chatDays = pickDays(chats, parseChatDay);
  // 이름 짓기 도입 전 데이터: 이름을 바꿨거나 이미 앱을 써 왔으면(기록이 있으면) 지은 것으로 본다.
  // 처음 실행 화면은 정말 처음인 사람에게만 보여준다
  const used = Object.keys(records).length > 0 || Object.keys(chatDays).length > 0;
  const named = typeof profile.named === 'boolean' ? profile.named : birdName !== DEFAULT_BIRD_NAME || used;

  return {
    version: 1,
    profile: { installId, startedOn, birdName, named, lastSeenStage },
    missions: {
      records,
      swaps: pickDays(missions.swaps, (v) => (typeof v === 'string' ? v : null)),
    },
    chats: chatDays,
    settings: parseSettings(settings),
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
