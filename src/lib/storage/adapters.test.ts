import {
  BACKUP_KEY,
  STORAGE_KEY,
  createDefaultState,
  createLocalStorageAdapter,
  createMemoryAdapter,
  parseState,
} from './adapters';
import type { OngiState } from './types';
import { FakeStorage } from '@/test/fake-storage';

const NOW = new Date('2026-09-26T01:00:00Z'); // 한국 2026-09-26 10:00

describe('createDefaultState', () => {
  it('처음 상태: 이름 오목이, 1단계, 오늘 시작, 기록 없음', () => {
    const s = createDefaultState(NOW);
    expect(s.version).toBe(1);
    expect(s.profile.birdName).toBe('오목이');
    expect(s.profile.lastSeenStage).toBe(1);
    expect(s.profile.startedOn).toBe('2026-09-26');
    expect(s.profile.installId.length).toBeGreaterThan(0);
    expect(s.missions).toEqual({ records: {}, swaps: {} });
    expect(s.chats).toEqual({});
    expect(s.tests).toEqual({});
    expect(s.profile.introSeen).toBe(false);
    expect(s.savedLetters).toEqual([]);
    expect(s.settings).toEqual({ demoMode: false, dayOffset: 0, stageOverride: null, seenChatNotice: false });
  });

  it('installId를 주면 그대로 쓴다', () => {
    expect(createDefaultState(NOW, 'fixed-id').profile.installId).toBe('fixed-id');
  });
});

describe('parseState', () => {
  it('JSON이 아니거나 버전이 다르면 null', () => {
    expect(parseState(null)).toBeNull();
    expect(parseState('not json')).toBeNull();
    expect(parseState(JSON.stringify({ version: 2 }))).toBeNull();
    expect(parseState(JSON.stringify({ version: 1 }))).toBeNull();
  });

  it('기본 상태는 저장했다 읽어도 같다', () => {
    const s = createDefaultState(NOW, 'id-1');
    expect(parseState(JSON.stringify(s))).toEqual(s);
  });

  it('예전 데이터에 없는 설정 값은 기본값으로 채운다', () => {
    const s = createDefaultState(NOW, 'id-1');
    const old = { ...s, settings: { demoMode: true, dayOffset: 2 } };
    expect(parseState(JSON.stringify(old))?.settings).toEqual({
      demoMode: true,
      dayOffset: 2,
      stageOverride: null,
      seenChatNotice: false,
    });
  });
});

describe('parseState — 이름 짓기 도입 전 데이터', () => {
  // named 값이 없던 예전 데이터를 만든다
  function withoutNamed(birdName: string, edit?: (state: OngiState) => void) {
    const state = createDefaultState(NOW, 'id-1');
    edit?.(state);
    const profile: Partial<OngiState['profile']> = { ...state.profile, birdName };
    delete profile.named;
    return JSON.stringify({ ...state, profile });
  }

  it('이름을 바꾼 적 있으면 지은 것으로, 기본 이름(예전 기본값 뱁새 포함) 그대로면 짓지 않은 것으로 본다', () => {
    expect(parseState(withoutNamed('콩이'))?.profile.named).toBe(true);
    expect(parseState(withoutNamed('오목이'))?.profile.named).toBe(false);
    expect(parseState(withoutNamed('뱁새'))?.profile.named).toBe(false);
  });

  it('이미 미션이나 대화 기록이 있으면 이름이 기본값 그대로여도 지은 것으로 본다 (처음 화면을 다시 띄우지 않게)', () => {
    const withMission = withoutNamed('뱁새', (s) => {
      s.missions.records['2026-09-20'] = { missionId: 'walk-10', completedAt: '2026-09-20T01:00:00.000Z' };
    });
    const withChat = withoutNamed('뱁새', (s) => {
      s.chats['2026-09-20'] = { question: 'Q', messages: [{ role: 'user', content: '안녕', at: '2026-09-20T01:00:00.000Z' }], bridgeShown: false };
    });
    expect(parseState(withMission)?.profile.named).toBe(true);
    expect(parseState(withChat)?.profile.named).toBe(true);
  });
});

describe('parseState — 값까지 검사', () => {
  // 저장된 JSON을 고쳐서 다시 읽는다 (개발자 도구로 고쳤거나 예전 버전이 남긴 데이터)
  type EditableState = { profile: Record<string, unknown>; missions: Record<string, unknown>; chats: unknown; settings: unknown };
  function parseEdited(edit: (data: EditableState) => void) {
    const data = JSON.parse(JSON.stringify(createDefaultState(NOW, 'id-1')));
    edit(data);
    return parseState(JSON.stringify(data));
  }

  it('프로필 값이 망가졌으면 통째로 버린다 (백업 후 새로 시작)', () => {
    expect(parseEdited((d) => (d.profile.birdName = { name: '콩이' }))).toBeNull();
    expect(parseEdited((d) => (d.profile.startedOn = 'yesterday'))).toBeNull();
    expect(parseEdited((d) => (d.profile.lastSeenStage = 9))).toBeNull();
  });

  it('잘못된 미션 기록·교체만 빼고 나머지는 살린다', () => {
    const s = parseEdited((d) => {
      d.missions.records = {
        '2026-09-25': { missionId: 'walk-10', completedAt: '2026-09-25T01:00:00.000Z', note: '좋았다' },
        '2026-09-24': 'oops',
        '2026-13-45': { missionId: 'walk-10', completedAt: '2026-09-25T01:00:00.000Z' },
      };
      d.missions.swaps = { '2026-09-25': 'cafe', '2026-09-24': 3 };
    });
    expect(s?.missions.records).toEqual({
      '2026-09-25': { missionId: 'walk-10', completedAt: '2026-09-25T01:00:00.000Z', note: '좋았다' },
    });
    expect(s?.missions.swaps).toEqual({ '2026-09-25': 'cafe' });
  });

  it('형식이 잘못된 날의 대화만 빼고 나머지는 살린다', () => {
    const good = { question: 'Q', messages: [{ role: 'user', content: '안녕', at: '2026-09-25T01:00:00.000Z' }], bridgeShown: false };
    const s = parseEdited((d) => {
      d.chats = {
        '2026-09-25': good,
        '2026-09-24': { question: 'Q', messages: 'x', bridgeShown: false },
        '2026-09-23': { question: 'Q', messages: [{ role: 'user', content: { text: '안녕' }, at: '' }], bridgeShown: false },
      };
    });
    expect(s?.chats).toEqual({ '2026-09-25': good });
  });

  it('시작 화면 기록이 없던 예전 데이터: 이름을 지었으면 본 것으로, 아니면 안 본 것으로 본다', () => {
    const named = parseEdited((d) => {
      delete d.profile.introSeen;
      d.profile.named = true;
    });
    const fresh = parseEdited((d) => {
      delete d.profile.introSeen;
      d.profile.named = false;
    });
    expect(named?.profile.introSeen).toBe(true);
    expect(fresh?.profile.introSeen).toBe(false);
  });

  it('카카오 로그인 화면을 지났는지: 처음엔 아니고, 값이 없던 예전 데이터도 로그인 전으로 읽는다', () => {
    expect(createDefaultState(NOW).profile.signedIn).toBe(false);
    expect(parseEdited((d) => delete d.profile.signedIn)?.profile.signedIn).toBe(false);
    expect(parseEdited((d) => (d.profile.signedIn = true))?.profile.signedIn).toBe(true);
  });

  it('가방에 담은 편지는 숫자 id만 겹치지 않게 남긴다 (예전 데이터는 빈 목록)', () => {
    expect(parseEdited((d) => delete (d as { savedLetters?: unknown }).savedLetters)?.savedLetters).toEqual([]);
    expect(parseEdited((d) => ((d as { savedLetters?: unknown }).savedLetters = [3, 'x', 3, 7]))?.savedLetters).toEqual([3, 7]);
  });

  it('심리테스트 결과가 없던 예전 데이터는 빈 기록으로, 모양이 잘못된 결과는 빼고 읽는다', () => {
    expect(parseEdited((d) => delete (d as { tests?: unknown }).tests)?.tests).toEqual({});
    const s = parseEdited(
      (d) =>
        ((d as { tests?: unknown }).tests = {
          weather: { resultId: 'sunny', at: '2026-09-27T01:00:00.000Z' },
          coping: { resultId: 3 },
          'self-esteem': 'warm',
        }),
    );
    expect(s?.tests).toEqual({ weather: { resultId: 'sunny', at: '2026-09-27T01:00:00.000Z' } });
  });

  it('설정 값이 잘못됐으면 그 값만 기본값으로 되돌린다', () => {
    const s = parseEdited((d) => (d.settings = { demoMode: 'yes', dayOffset: '3', stageOverride: 9, seenChatNotice: true }));
    expect(s?.settings).toEqual({ demoMode: false, dayOffset: 0, stageOverride: null, seenChatNotice: true });
  });
});

describe('createLocalStorageAdapter', () => {
  it('쓰기에서 예외가 나는 저장소(사생활 보호 모드)면 null', () => {
    expect(createLocalStorageAdapter(new FakeStorage(true))).toBeNull();
  });

  it('저장한 상태를 다시 읽는다', () => {
    const adapter = createLocalStorageAdapter(new FakeStorage())!;
    expect(adapter.persistent).toBe(true);
    expect(adapter.load()).toBeNull();
    const s = createDefaultState(NOW, 'id-2');
    adapter.save(s);
    expect(adapter.load()).toEqual(s);
  });

  it('깨진 데이터는 백업 키에 옮겨두고 null을 준다', () => {
    const storage = new FakeStorage();
    storage.setItem(STORAGE_KEY, '{broken');
    const adapter = createLocalStorageAdapter(storage)!;
    expect(adapter.load()).toBeNull();
    expect(storage.getItem(BACKUP_KEY)).toBe('{broken');
  });
});

describe('createMemoryAdapter', () => {
  it('저장되지 않는 어댑터라고 알린다', () => {
    const adapter = createMemoryAdapter();
    expect(adapter.persistent).toBe(false);
    expect(adapter.load()).toBeNull();
    const s = createDefaultState(NOW, 'id-3');
    adapter.save(s);
    expect(adapter.load()).toEqual(s);
  });
});
