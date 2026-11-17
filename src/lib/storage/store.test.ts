import { createLocalStorageAdapter, createMemoryAdapter, parseState, STORAGE_KEY, BACKUP_KEY } from './adapters';
import { createStore } from './store';

const clock = () => new Date('2026-10-18T10:00:00Z');
const words = { kind: 'words' as const, words: ['happy'] };
const track = (id: string) => ({ id, audioUrl: `/samples/${id}.mp3`, duration: null, temporary: false });

function setup() {
  const adapter = createMemoryAdapter();
  return { adapter, store: createStore(adapter, clock) };
}

describe('store', () => {
  it('닉네임은 1~12자, 앞뒤 공백 제거', () => {
    const { store } = setup();
    expect(store.setNickname('   ').ok).toBe(false);
    expect(store.setNickname('열세글자가넘는아주긴닉네임이에요').ok).toBe(false);
    expect(store.setNickname('  오목팬 ').ok).toBe(true);
    expect(store.getState().profile.nickname).toBe('오목팬');
  });

  it('심리테스트 결과는 최근 것이 앞에 쌓인다', () => {
    const { store } = setup();
    store.saveTestResult('example', 'a');
    store.saveTestResult('example', 'c');
    expect(store.getState().tests.map((t) => t.resultId)).toEqual(['c', 'a']);
  });

  it('오늘 기분은 하루 하나, 같은 날 다시 고르면 덮어쓴다', () => {
    const { store } = setup();
    store.recordMood('sad');
    store.recordMood('joy', { note: '  산책했다 ' });
    expect(store.getState().moods).toEqual([
      { day: '2026-10-18', mood: 'joy', source: 'checkin', note: '산책했다', at: '2026-10-18T10:00:00.000Z' },
    ]);
  });

  it('감정이 있는 테스트 결과는 오늘 기분으로도 기록된다', () => {
    const { store } = setup();
    store.saveTestResult('example', 'a');
    expect(store.getState().moods).toEqual([]);
    store.saveTestResult('mind-weather', 'rain', 'sad');
    expect(store.getState().moods[0]).toMatchObject({ mood: 'sad', source: 'test', testId: 'mind-weather' });
  });

  it('작곡 완료: 곡 2개가 내 노래에 들어가고 결과로 보인다', () => {
    const { store } = setup();
    store.addPending({ taskId: 't1', title: '행복의 노래', source: words, mode: 'sample' });
    expect(store.getState().pending).toHaveLength(1);

    store.completePending('t1', [track('a'), track('b')]);
    const state = store.getState();
    expect(state.pending).toEqual([]);
    expect(state.songs.map((s) => s.title)).toEqual(['행복의 노래', '행복의 노래 #2']);
    expect(state.songs[0]).toMatchObject({ source: words, mode: 'sample', createdAt: '2026-10-18T10:00:00.000Z' });
    expect(state.outcome).toEqual({ songIds: ['a', 'b'] });

    // 같은 작업 완료가 두 번 와도(다른 탭) 곡이 겹치지 않는다
    store.completePending('t1', [track('a'), track('b')]);
    expect(store.getState().songs).toHaveLength(2);
  });

  it('방금 만든 곡은 저장 전이고, 저장하지 않은 곡은 결과를 닫으면 사라진다', () => {
    const { store } = setup();
    store.addPending({ taskId: 't1', title: '행복의 노래', source: words, mode: 'sample' });
    store.completePending('t1', [track('a'), track('b')]);
    expect(store.getState().songs.map((s) => s.saved)).toEqual([false, false]);

    store.setSongSaved('b', true);
    store.dismissOutcome();
    expect(store.getState().songs.map((s) => s.id)).toEqual(['b']);
    expect(store.getState().songs[0].saved).toBe(true);
  });

  it('새 노래를 만들면 이전 결과의 저장 안 한 곡은 사라진다', () => {
    const { store } = setup();
    store.addPending({ taskId: 't1', title: '행복의 노래', source: words, mode: 'sample' });
    store.completePending('t1', [track('a'), track('b')]);
    store.setSongSaved('a', true);
    store.addPending({ taskId: 't2', title: '슬픔의 노래', source: words, mode: 'sample' });
    expect(store.getState().songs.map((s) => s.id)).toEqual(['a']);
  });

  it('내 노래 이름은 1~30자로 바꿀 수 있다', () => {
    const { store } = setup();
    store.addPending({ taskId: 't1', title: '행복의 노래', source: words, mode: 'sample' });
    store.completePending('t1', [track('a'), track('b')]);

    expect(store.renameSong('a', '  봄날의 산책  ')).toEqual({ ok: true });
    expect(store.getState().songs.map((s) => s.title)).toEqual(['봄날의 산책', '행복의 노래 #2']);
    expect(store.renameSong('a', ' ')).toEqual({ ok: false });
    expect(store.renameSong('a', '가'.repeat(31))).toEqual({ ok: false });
    expect(store.renameSong('없는곡', '이름')).toEqual({ ok: false });
    expect(store.getState().songs[0].title).toBe('봄날의 산책');
  });

  it('작곡 실패는 이유를 남기고, 확인하면 지운다', () => {
    const { store } = setup();
    store.addPending({ taskId: 't1', title: 'x', source: words, mode: 'suno' });
    store.failPending('t1', '크레딧이 부족해요');
    expect(store.getState().outcome).toEqual({ error: '크레딧이 부족해요' });
    store.dismissOutcome();
    expect(store.getState().outcome).toBeNull();
  });

  it('바뀐 상태를 저장하고 구독자에게 알린다', () => {
    const { adapter, store } = setup();
    const listener = vi.fn();
    store.subscribe(listener);
    store.setBirth({ date: '2003-05-07', time: null });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(adapter.load()?.profile.birth).toEqual({ date: '2003-05-07', time: null });
  });
});

describe('계정 기록 (카카오 회원 동기화)', () => {
  it('계정 기록으로 바꿔 넣어도 방금 만든 곡(저장 전), 작곡 결과, 대화는 그대로 둔다', () => {
    const { store } = setup();
    store.addChatMessage({ role: 'user', text: '안녕' });
    store.addPending({ taskId: 't1', title: '행복의 노래', source: words, mode: 'sample' });
    store.completePending('t1', [track('fresh')]);
    const old = { ...track('old'), title: '옛 노래', mode: 'sample' as const, source: words, createdAt: '2026-10-01T00:00:00.000Z', saved: true };

    store.replaceRecords({
      profile: { nickname: '동글이', birth: { date: '2003-02-01', time: null } },
      moods: [{ day: '2026-10-17', mood: 'sad', source: 'daily', at: '2026-10-17T10:00:00.000Z' }],
      tests: [{ testId: 'mind-sound', resultId: 'c', at: '2026-10-17T10:00:00.000Z' }],
      savedSongs: [old],
    });

    const state = store.getState();
    expect(state.profile).toEqual({ nickname: '동글이', birth: { date: '2003-02-01', time: null }, metOmok: false });
    expect(state.moods.map((m) => m.day)).toEqual(['2026-10-17']);
    expect(state.tests).toEqual([{ testId: 'mind-sound', resultId: 'c', at: '2026-10-17T10:00:00.000Z' }]);
    expect(state.songs.map((s) => s.id)).toEqual(['fresh', 'old']);
    expect(state.outcome).toEqual({ songIds: ['fresh'] });
    expect(state.chat.messages).toHaveLength(1);
  });

  it('계정 기록으로 바꿔 넣어도 이 기기에서 고른 테스트 답은 같은 테스트 기록에 남긴다 (답은 계정에 올리지 않는다)', () => {
    const { store } = setup();
    const answers = [{ q: '비 오는 날 나는?', a: '창밖을 본다' }];
    store.saveTestResult('mind-sound', 'c', undefined, answers);
    const { testId, resultId, at } = store.getState().tests[0];

    store.replaceRecords({ profile: { nickname: null, birth: null }, moods: [], tests: [{ testId, resultId, at }], savedSongs: [] });

    expect(store.getState().tests).toEqual([{ testId, resultId, at, answers }]);
  });

  it('계정 기록 지우기: 닉네임·생일·기분·테스트·저장한 곡을 지우고, 대화와 저장 전 곡은 둔다', () => {
    const { store } = setup();
    store.setNickname('동글이');
    store.setBirth({ date: '2003-02-01', time: null });
    store.meetOmok();
    store.recordMood('sad');
    store.saveTestResult('mind-sound', 'c');
    store.addPending({ taskId: 't1', title: '행복의 노래', source: words, mode: 'sample' });
    store.completePending('t1', [track('a'), track('b')]);
    store.setSongSaved('a', true);
    store.addChatMessage({ role: 'user', text: '안녕' });

    store.clearRecords();

    const state = store.getState();
    expect(state.profile).toEqual({ nickname: null, birth: null, metOmok: true });
    expect(state.moods).toEqual([]);
    expect(state.tests).toEqual([]);
    expect(state.songs.map((s) => s.id)).toEqual(['b']);
    expect(state.chat.messages).toHaveLength(1);
  });
});

describe('parseState', () => {
  it('망가진 문자열·다른 버전은 null', () => {
    expect(parseState('{')).toBeNull();
    expect(parseState(JSON.stringify({ version: 2, profile: {} }))).toBeNull();
  });

  it('저장 버튼 이전에 만든 곡은 저장된 곡으로 읽는다', () => {
    const song = { id: 'a', title: '옛 노래', audioUrl: '/samples/a.mp3', duration: null, temporary: false, mode: 'sample', source: words, createdAt: '2026-10-18T10:00:00.000Z' };
    const state = parseState(JSON.stringify({ version: 1, profile: {}, songs: [song, { ...song, id: 'b', saved: false }] }));
    expect(state?.songs.map((s) => s.saved)).toEqual([true, false]);
  });

  it('잘못된 항목만 버린다', () => {
    const state = parseState(
      JSON.stringify({
        version: 1,
        profile: { nickname: 3, birth: { date: '2026-02-30', time: null }, metOmok: true },
        tests: [{ testId: 'example', resultId: 'a', at: 'x' }, { nope: 1 }],
        songs: [{ id: 'bad' }],
        moods: [{ day: '2026-10-18', mood: 'calm', source: 'checkin', at: 'x' }, { day: '2026-10-19', mood: 'meh', source: 'checkin', at: 'x' }],
        pending: 'x',
        outcome: { songIds: [1] },
      }),
    );
    expect(state).toEqual({
      version: 1,
      profile: { nickname: null, birth: null, metOmok: true },
      tests: [{ testId: 'example', resultId: 'a', at: 'x' }],
      songs: [],
      moods: [{ day: '2026-10-18', mood: 'calm', source: 'checkin', at: 'x' }],
      chat: { messages: [], note: null },
      pending: [],
      outcome: null,
    });
  });

  it('태어난 시각이 이상하면 모름(null)으로', () => {
    const state = parseState(JSON.stringify({ version: 1, profile: { birth: { date: '2003-05-07', time: '25:00' } } }));
    expect(state?.profile.birth).toEqual({ date: '2003-05-07', time: null });
  });
});

describe('createLocalStorageAdapter', () => {
  it('망가진 기록은 백업해 두고 새로 시작한다', () => {
    localStorage.setItem(STORAGE_KEY, 'broken');
    const adapter = createLocalStorageAdapter(localStorage)!;
    expect(adapter.load()).toBeNull();
    expect(localStorage.getItem(BACKUP_KEY)).toBe('broken');
  });
});
