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
