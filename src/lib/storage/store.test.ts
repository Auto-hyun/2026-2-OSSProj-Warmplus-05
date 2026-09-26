import { BACKUP_KEY, STORAGE_KEY, createDefaultState, createLocalStorageAdapter, createMemoryAdapter } from './adapters';
import { createStore } from './store';
import { completedCount } from './selectors';
import { missionFor, swapCandidateFor } from '@/lib/progress';
import { FakeStorage } from '@/test/fake-storage';

const NOW = new Date('2026-09-26T01:00:00Z'); // 한국 2026-09-26 10:00
const clock = () => NOW;

function freshStore() {
  const adapter = createMemoryAdapter(createDefaultState(NOW, 'install-x'));
  return { store: createStore(adapter, clock), adapter };
}

describe('todayKey', () => {
  it('한국 날짜 + 시연 날짜 이동', () => {
    const { store } = freshStore();
    expect(store.todayKey()).toBe('2026-09-26');
    store.demo.shiftDay(1);
    expect(store.todayKey()).toBe('2026-09-27');
    store.demo.resetDay();
    expect(store.todayKey()).toBe('2026-09-26');
  });
});

describe('completeMission', () => {
  it('같은 날 두 번 눌러도 한 번만 기록된다', () => {
    const { store } = freshStore();
    expect(store.completeMission().ok).toBe(true);
    expect(store.completeMission().ok).toBe(false);
    expect(completedCount(store.getState())).toBe(1);
  });

  it('오늘의 미션 id와 완료 시각을 기록한다', () => {
    const { store } = freshStore();
    store.completeMission();
    const record = store.getState().missions.records['2026-09-26'];
    expect(record.missionId).toBe(missionFor('install-x', '2026-09-26').id);
    expect(record.completedAt).toBe(NOW.toISOString());
    expect(record.demo).toBeUndefined();
  });

  it('메모는 앞뒤 공백을 지우고 100자까지만 저장한다', () => {
    const { store } = freshStore();
    store.completeMission({ note: `  ${'가'.repeat(150)}  ` });
    expect(store.getState().missions.records['2026-09-26'].note).toBe('가'.repeat(100));
  });

  it('빈 메모는 저장하지 않는다', () => {
    const { store } = freshStore();
    store.completeMission({ note: '   ' });
    expect(store.getState().missions.records['2026-09-26'].note).toBeUndefined();
  });

  it('완료하면 저장소에도 저장된다', () => {
    const { store, adapter } = freshStore();
    store.completeMission();
    expect(adapter.load()?.missions.records['2026-09-26']).toBeDefined();
  });
});

describe('swapMission', () => {
  it('하루 한 번 교체 후보로 바꾸고, 완료 기록도 바뀐 미션이다', () => {
    const { store } = freshStore();
    const candidate = swapCandidateFor('install-x', '2026-09-26');
    expect(store.swapMission().ok).toBe(true);
    expect(store.getState().missions.swaps['2026-09-26']).toBe(candidate.id);
    expect(store.swapMission().ok).toBe(false);
    store.completeMission();
    expect(store.getState().missions.records['2026-09-26'].missionId).toBe(candidate.id);
  });

  it('이미 완료했으면 교체할 수 없다', () => {
    const { store } = freshStore();
    store.completeMission();
    expect(store.swapMission().ok).toBe(false);
  });
});

describe('대화 기록', () => {
  it('없던 날이면 질문과 함께 만들고 메시지를 쌓는다', () => {
    const { store } = freshStore();
    store.appendChatMessage('2026-09-26', '오늘 마음 날씨는 어떤가요?', { role: 'user', content: '맑음' });
    store.appendChatMessage('2026-09-26', '무시되는 질문', { role: 'assistant', content: '좋아요', kind: 'safety' });
    const day = store.getState().chats['2026-09-26'];
    expect(day.question).toBe('오늘 마음 날씨는 어떤가요?');
    expect(day.bridgeShown).toBe(false);
    expect(day.messages).toEqual([
      { role: 'user', content: '맑음', at: NOW.toISOString() },
      { role: 'assistant', content: '좋아요', at: NOW.toISOString(), kind: 'safety' },
    ]);
  });

  it('온기우편함 연결 카드 표시 여부를 기록한다', () => {
    const { store } = freshStore();
    store.appendChatMessage('2026-09-26', 'Q', { role: 'user', content: 'a' });
    store.markBridgeShown('2026-09-26');
    expect(store.getState().chats['2026-09-26'].bridgeShown).toBe(true);
  });
});

describe('renameBird', () => {
  it('앞뒤 공백을 지우고 1~10자만 허용한다', () => {
    const { store } = freshStore();
    expect(store.renameBird('   ').ok).toBe(false);
    expect(store.renameBird('가나다라마바사아자차카').ok).toBe(false);
    expect(store.renameBird(' 콩이 ').ok).toBe(true);
    expect(store.getState().profile.birdName).toBe('콩이');
  });
});

describe('설정·프로필', () => {
  it('마지막으로 본 단계와 대화 안내 확인 여부를 기록한다', () => {
    const { store } = freshStore();
    store.setLastSeenStage(3);
    store.markChatNoticeSeen();
    expect(store.getState().profile.lastSeenStage).toBe(3);
    expect(store.getState().settings.seenChatNotice).toBe(true);
  });

  it('resetAll은 installId만 남기고 처음으로 돌린다', () => {
    const { store } = freshStore();
    store.completeMission();
    store.renameBird('콩이');
    store.appendChatMessage('2026-09-26', 'Q', { role: 'user', content: 'a' });
    store.resetAll();
    const s = store.getState();
    expect(s.profile.installId).toBe('install-x');
    expect(s.profile.birdName).toBe('뱁새');
    expect(completedCount(s)).toBe(0);
    expect(s.chats).toEqual({});
  });
});

describe('시연 모드', () => {
  it('addCompletion은 오늘 이전의 빈 날짜를 최근부터 채운다', () => {
    const { store } = freshStore();
    store.demo.addCompletion();
    store.demo.addCompletion();
    store.demo.addCompletion();
    const records = store.getState().missions.records;
    expect(Object.keys(records).sort()).toEqual(['2026-09-23', '2026-09-24', '2026-09-25']);
    expect(records['2026-09-25'].demo).toBe(true);
    expect(records['2026-09-25'].missionId).toBe(missionFor('install-x', '2026-09-25').id);
  });

  it('이미 기록이 있는 날은 건너뛴다', () => {
    const { store } = freshStore();
    store.demo.shiftDay(-1); // 오늘 = 09-25
    store.completeMission();
    store.demo.resetDay(); // 오늘 = 09-26
    store.demo.addCompletion();
    expect(Object.keys(store.getState().missions.records).sort()).toEqual(['2026-09-24', '2026-09-25']);
  });

  it('끄면 날짜 이동과 단계 강제 표시를 되돌린다', () => {
    const { store } = freshStore();
    store.demo.setEnabled(true);
    store.demo.shiftDay(3);
    store.demo.setStageOverride(4);
    expect(store.getState().settings).toMatchObject({ demoMode: true, dayOffset: 3, stageOverride: 4 });
    store.demo.setEnabled(false);
    expect(store.getState().settings).toMatchObject({ demoMode: false, dayOffset: 0, stageOverride: null });
  });
});

describe('구독', () => {
  it('상태가 바뀌면 알리고, 해지하면 멈춘다', () => {
    const { store } = freshStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.completeMission();
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    store.renameBird('콩이');
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('깨진 저장 데이터', () => {
  it('기본 상태로 시작하고 원래 데이터는 백업해 둔다', () => {
    const storage = new FakeStorage();
    storage.setItem(STORAGE_KEY, '{"version":1,"profile":');
    const store = createStore(createLocalStorageAdapter(storage)!, clock);
    expect(store.getState().profile.birdName).toBe('뱁새');
    expect(storage.getItem(BACKUP_KEY)).toBe('{"version":1,"profile":');
  });
});
