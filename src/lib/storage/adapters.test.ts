import {
  BACKUP_KEY,
  STORAGE_KEY,
  createDefaultState,
  createLocalStorageAdapter,
  createMemoryAdapter,
  parseState,
} from './adapters';
import { FakeStorage } from '@/test/fake-storage';

const NOW = new Date('2026-09-26T01:00:00Z'); // 한국 2026-09-26 10:00

describe('createDefaultState', () => {
  it('처음 상태: 이름 뱁새, 1단계, 오늘 시작, 기록 없음', () => {
    const s = createDefaultState(NOW);
    expect(s.version).toBe(1);
    expect(s.profile.birdName).toBe('뱁새');
    expect(s.profile.lastSeenStage).toBe(1);
    expect(s.profile.startedOn).toBe('2026-09-26');
    expect(s.profile.installId.length).toBeGreaterThan(0);
    expect(s.missions).toEqual({ records: {}, swaps: {} });
    expect(s.chats).toEqual({});
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
