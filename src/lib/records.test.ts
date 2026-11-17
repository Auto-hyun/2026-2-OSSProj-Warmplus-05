import { createDefaultState } from '@/lib/storage/adapters';
import type { MoodEntry, Records, Song } from '@/lib/storage/types';
import { diffRecords, EMPTY_RECORDS, hasChanges, mergeRecords, recordsOf } from './records';

const words = { kind: 'words' as const, words: ['sadness'] };
const song = (id: string, over: Partial<Song> = {}): Song => ({
  id,
  title: `${id} 노래`,
  audioUrl: '/samples/sad-1.mp3',
  duration: null,
  temporary: false,
  mode: 'sample',
  source: words,
  createdAt: '2026-11-10T00:00:00.000Z',
  saved: true,
  ...over,
});
const mood = (day: string, over: Partial<MoodEntry> = {}): MoodEntry => ({ day, mood: 'sad', source: 'daily', at: `${day}T10:00:00.000Z`, ...over });
const result = (at: string) => ({ testId: 'mind-sound', resultId: 'c', at });

describe('recordsOf', () => {
  it('계정에 올릴 기록만 고른다 (저장한 노래만, 대화·첫인사는 빼고)', () => {
    const state = { ...createDefaultState(), profile: { nickname: '동글이', birth: null, metOmok: true }, songs: [song('a'), song('b', { saved: false })] };
    expect(recordsOf(state)).toEqual({ profile: { nickname: '동글이', birth: null }, moods: [], tests: [], savedSongs: [song('a')] });
  });
});

describe('mergeRecords (처음 로그인한 기기에서 기기 기록과 계정 기록 합치기)', () => {
  it('같은 날 기분은 나중에 기록한 것, 다른 날은 모두 남긴다 (최근 날이 앞)', () => {
    const local = { ...EMPTY_RECORDS, moods: [mood('2026-11-17', { mood: 'joy', at: '2026-11-17T12:00:00.000Z' }), mood('2026-11-15')] };
    const remote = { ...EMPTY_RECORDS, moods: [mood('2026-11-17', { at: '2026-11-17T09:00:00.000Z' }), mood('2026-11-16')] };
    expect(mergeRecords(local, remote).moods.map((m) => `${m.day} ${m.mood}`)).toEqual(['2026-11-17 joy', '2026-11-16 sad', '2026-11-15 sad']);
  });

  it('테스트 결과는 합치되 같은 결과는 한 번만 (최근 것이 앞)', () => {
    const local = { ...EMPTY_RECORDS, tests: [result('2026-11-17T10:00:00.000Z'), result('2026-11-01T10:00:00.000Z')] };
    const remote = { ...EMPTY_RECORDS, tests: [result('2026-11-10T10:00:00.000Z'), result('2026-11-01T10:00:00.000Z')] };
    expect(mergeRecords(local, remote).tests.map((t) => t.at)).toEqual(['2026-11-17T10:00:00.000Z', '2026-11-10T10:00:00.000Z', '2026-11-01T10:00:00.000Z']);
  });

  it('저장한 노래는 합치고, 같은 노래면 계정 쪽(다른 기기에서 바꾼 이름)을 쓴다', () => {
    const local = { ...EMPTY_RECORDS, savedSongs: [song('a', { title: '기기 이름' }), song('b', { createdAt: '2026-11-12T00:00:00.000Z' })] };
    const remote = { ...EMPTY_RECORDS, savedSongs: [song('a', { title: '계정 이름' }), song('c', { createdAt: '2026-11-11T00:00:00.000Z' })] };
    expect(mergeRecords(local, remote).savedSongs.map((s) => `${s.id} ${s.title}`)).toEqual(['b b 노래', 'c c 노래', 'a 계정 이름']);
  });

  it('프로필은 계정에 있는 값을 쓰고, 계정에 없는 값만 기기 값으로 채운다', () => {
    const local = { ...EMPTY_RECORDS, profile: { nickname: '기기닉', birth: { date: '2003-02-01', time: null } } };
    const remote = { ...EMPTY_RECORDS, profile: { nickname: '계정닉', birth: null } };
    expect(mergeRecords(local, remote).profile).toEqual({ nickname: '계정닉', birth: { date: '2003-02-01', time: null } });
  });
});

describe('diffRecords (바뀐 것만 계정에 올리기)', () => {
  const before: Records = { profile: { nickname: '동글이', birth: null }, moods: [mood('2026-11-16')], tests: [result('2026-11-16T10:00:00.000Z')], savedSongs: [song('a'), song('b')] };

  it('바뀐 게 없으면 올릴 것도 없다', () => {
    expect(hasChanges(diffRecords(before, { ...before }))).toBe(false);
  });

  it('새로 기록한 날, 다시 기록한 날, 새 테스트 결과, 새로 저장했거나 이름을 바꾼 노래, 바뀐 프로필을 찾는다', () => {
    const after: Records = {
      profile: { nickname: '새닉네임', birth: null },
      moods: [mood('2026-11-17'), mood('2026-11-16', { mood: 'joy' })],
      tests: [result('2026-11-17T10:00:00.000Z'), result('2026-11-16T10:00:00.000Z')],
      savedSongs: [song('c'), song('a', { title: '새 이름' }), song('b')],
    };
    const changes = diffRecords(before, after);
    expect(changes.profile).toEqual({ nickname: '새닉네임', birth: null });
    expect(changes.moods.map((m) => `${m.day} ${m.mood}`)).toEqual(['2026-11-17 sad', '2026-11-16 joy']);
    expect(changes.tests.map((t) => t.at)).toEqual(['2026-11-17T10:00:00.000Z']);
    expect(changes.songs.map((s) => s.id)).toEqual(['c', 'a']);
    expect(changes.removedSongIds).toEqual([]);
  });

  it('저장을 취소했거나 지운 노래는 계정에서 지울 목록에 넣는다', () => {
    const changes = diffRecords(before, { ...before, savedSongs: [song('a')] });
    expect(changes.removedSongIds).toEqual(['b']);
    expect(hasChanges(changes)).toBe(true);
  });
});
