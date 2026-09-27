import { BACKUP_KEY, STORAGE_KEY, createDefaultState, createLocalStorageAdapter, createMemoryAdapter, parseState } from './adapters';
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

  it('메모를 100자에서 자를 때 이모지가 반쪽으로 깨지지 않는다', () => {
    const { store } = freshStore();
    store.completeMission({ note: `${'a'.repeat(99)}😀😀` });
    expect(store.getState().missions.records['2026-09-26'].note).toBe(`${'a'.repeat(99)}😀`);
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

describe('completeMission (자정을 넘긴 완료)', () => {
  it('화면에 보이던 날짜가 오늘이 아니면 기록하지 않고 이유를 알려준다', () => {
    const { store } = freshStore();
    expect(store.completeMission({ dayKey: '2026-09-25' })).toEqual({ ok: false, reason: 'day-changed' });
    expect(completedCount(store.getState())).toBe(0);
  });

  it('화면에 보이던 날짜가 오늘이면 기록한다', () => {
    const { store } = freshStore();
    expect(store.completeMission({ dayKey: '2026-09-26' }).ok).toBe(true);
    expect(store.getState().missions.records['2026-09-26']).toBeDefined();
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

describe('오목이 이름 짓기 (처음 실행)', () => {
  it('처음에는 아직 이름을 짓지 않은 상태다', () => {
    const { store } = freshStore();
    expect(store.getState().profile.named).toBe(false);
  });

  it('이름을 지으면 저장하고 지은 상태가 된다 (앞뒤 공백 제거, 1~10자)', () => {
    const { store } = freshStore();
    expect(store.completeNaming('   ').ok).toBe(false);
    expect(store.completeNaming('가나다라마바사아자차카').ok).toBe(false);
    expect(store.getState().profile.named).toBe(false);
    expect(store.completeNaming(' 콩이 ').ok).toBe(true);
    expect(store.getState().profile).toMatchObject({ birdName: '콩이', named: true });
  });

  it('나중에 하기를 고르면 오목이라는 이름으로 지은 상태가 된다', () => {
    const { store } = freshStore();
    expect(store.completeNaming().ok).toBe(true);
    expect(store.getState().profile).toMatchObject({ birdName: '오목이', named: true });
  });

  it('기록을 모두 지우면 다시 이름을 지어야 한다', () => {
    const { store } = freshStore();
    store.completeNaming('콩이');
    store.resetAll();
    expect(store.getState().profile).toMatchObject({ birdName: '오목이', named: false });
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
    expect(s.profile.birdName).toBe('오목이');
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
    expect(store.getState().profile.birdName).toBe('오목이');
    expect(storage.getItem(BACKUP_KEY)).toBe('{"version":1,"profile":');
  });
});

describe('여러 탭', () => {
  it('다른 탭에서 바뀐 기록을 받아와서, 이 탭의 옛 상태로 덮어쓰지 않는다', () => {
    const storage = new FakeStorage();
    const tabA = createStore(createLocalStorageAdapter(storage)!, clock);
    const tabB = createStore(createLocalStorageAdapter(storage)!, clock);
    const changed = vi.fn();
    tabB.subscribe(changed);

    tabA.completeMission();
    // 브라우저는 다른 탭에 storage 이벤트를 보낸다
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    expect(changed).toHaveBeenCalled();
    expect(completedCount(tabB.getState())).toBe(1);

    tabB.appendChatMessage('2026-09-26', 'Q', { role: 'user', content: '안녕' });
    const saved = parseState(storage.getItem(STORAGE_KEY))!;
    expect(completedCount(saved)).toBe(1);
    expect(saved.chats['2026-09-26'].messages).toHaveLength(1);
  });

  it('다른 키의 storage 이벤트는 무시한다', () => {
    const storage = new FakeStorage();
    const store = createStore(createLocalStorageAdapter(storage)!, clock);
    const changed = vi.fn();
    store.subscribe(changed);
    window.dispatchEvent(new StorageEvent('storage', { key: 'other-app' }));
    expect(changed).not.toHaveBeenCalled();
  });
});

describe('saveTestResult', () => {
  it('테스트마다 가장 최근 결과와 시각만 남긴다', () => {
    const { store } = freshStore();
    store.saveTestResult('weather', 'cloudy');
    store.saveTestResult('weather', 'sunny');
    store.saveTestResult('coping', 'sharer');
    expect(store.getState().tests).toEqual({
      weather: { resultId: 'sunny', at: NOW.toISOString() },
      coping: { resultId: 'sharer', at: NOW.toISOString() },
    });
  });

  it('기록을 모두 지우면 테스트 결과도 지운다', () => {
    const { store } = freshStore();
    store.saveTestResult('weather', 'sunny');
    store.resetAll();
    expect(store.getState().tests).toEqual({});
  });
});

describe('시작 화면 (먼저 도착한 편지)', () => {
  it('가방에 담은 편지는 최근 것이 앞에 오고, 같은 편지는 한 번만 남는다', () => {
    const { store } = freshStore();
    store.saveLetter(3475151);
    store.saveLetter(3545925);
    store.saveLetter(3475151);
    expect(store.getState().savedLetters).toEqual([3475151, 3545925]);
  });

  it('시작 화면을 마치면 다시 보여주지 않고, 기록을 모두 지우면 처음부터 다시 본다', () => {
    const { store } = freshStore();
    expect(store.getState().profile.introSeen).toBe(false);
    store.completeIntro();
    expect(store.getState().profile.introSeen).toBe(true);
    store.saveLetter(3475151);
    store.resetAll();
    expect(store.getState().profile.introSeen).toBe(false);
    expect(store.getState().savedLetters).toEqual([]);
  });

  it('카카오 로그인 화면에서 시작하면 로그인 전 상태를 벗어나고, 기록을 모두 지우면 로그인 화면부터 다시', () => {
    const { store } = freshStore();
    expect(store.getState().profile.signedIn).toBe(false);
    store.completeLogin();
    expect(store.getState().profile.signedIn).toBe(true);
    store.resetAll();
    expect(store.getState().profile.signedIn).toBe(false);
  });
});
