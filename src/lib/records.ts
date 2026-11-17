import type { SupabaseClient } from '@supabase/supabase-js';
import { isMoodId } from '@/data/moods';
import { isSongSource } from '@/lib/music/prompt';
import type { AppState, MoodEntry, Records, Song, TestRecord } from '@/lib/storage/types';

/**
 * 카카오 회원의 계정 기록 (Supabase profiles · mood_entries · test_results · saved_songs).
 * 기기 기록(AppState)과 같은 모양(Records)으로 주고받는다. 권한은 RLS가 지킨다: 회원 본인만, 익명 계정은 못 씀
 */
export const EMPTY_RECORDS: Records = { profile: { nickname: null, birth: null }, moods: [], tests: [], savedSongs: [] };

/** 기기 상태에서 계정에 올릴 기록만 고른다 (저장한 노래만, 대화는 빼고) */
export function recordsOf(state: AppState): Records {
  return {
    profile: { nickname: state.profile.nickname, birth: state.profile.birth },
    moods: state.moods,
    tests: state.tests,
    savedSongs: state.songs.filter((s) => s.saved),
  };
}

const testKey = (t: TestRecord) => `${t.testId}|${t.at}`;
const newestFirst = <T>(key: (item: T) => string) => (a: T, b: T) => key(b).localeCompare(key(a));
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** 처음 로그인한 기기: 기기 기록과 계정 기록을 합친다. 같은 날 기분은 나중 기록, 같은 노래와 프로필은 계정 쪽 */
export function mergeRecords(local: Records, remote: Records): Records {
  const moods = new Map(remote.moods.map((m) => [m.day, m]));
  for (const m of local.moods) {
    const theirs = moods.get(m.day);
    if (!theirs || m.at > theirs.at) moods.set(m.day, m);
  }
  const tests = new Map([...local.tests, ...remote.tests].map((t) => [testKey(t), t]));
  const songs = new Map([...local.savedSongs, ...remote.savedSongs].map((s) => [s.id, s]));
  return {
    profile: { nickname: remote.profile.nickname ?? local.profile.nickname, birth: remote.profile.birth ?? local.profile.birth },
    moods: [...moods.values()].sort(newestFirst((m) => m.day)),
    tests: [...tests.values()].sort(newestFirst((t) => t.at)),
    savedSongs: [...songs.values()].sort(newestFirst((s) => s.createdAt)),
  };
}

/** 계정에 올릴 바뀐 기록 */
export type RecordChanges = {
  profile: Records['profile'] | null;
  /** 새로 기록했거나 다시 기록한 날 */
  moods: MoodEntry[];
  /** 새 테스트 결과 */
  tests: TestRecord[];
  /** 새로 저장했거나 이름을 바꾼 노래 */
  songs: Song[];
  /** 저장을 취소했거나 지운 노래 */
  removedSongIds: string[];
};

export function diffRecords(prev: Records, next: Records): RecordChanges {
  const prevMoods = new Map(prev.moods.map((m) => [m.day, m]));
  const prevTests = new Set(prev.tests.map(testKey));
  const prevSongs = new Map(prev.savedSongs.map((s) => [s.id, s]));
  const nextSongIds = new Set(next.savedSongs.map((s) => s.id));
  return {
    profile: same(prev.profile, next.profile) ? null : next.profile,
    moods: next.moods.filter((m) => !same(prevMoods.get(m.day), m)),
    tests: next.tests.filter((t) => !prevTests.has(testKey(t))),
    songs: next.savedSongs.filter((s) => !same(prevSongs.get(s.id), s)),
    removedSongIds: prev.savedSongs.filter((s) => !nextSongIds.has(s.id)).map((s) => s.id),
  };
}

export function hasChanges(c: RecordChanges): boolean {
  return c.profile !== null || c.moods.length + c.tests.length + c.songs.length + c.removedSongIds.length > 0;
}

// ── Supabase 행 ↔ 기록 ──

type ProfileRow = { nickname: string | null; birth_date: string | null; birth_time: string | null };
type MoodRow = { day: string; mood: string; source: string; test_id: string | null; note: string | null; at: string };
type TestRow = { test_id: string; result_id: string; at: string };
type SongRow = {
  id: string;
  title: string;
  audio_url: string;
  duration: number | null;
  temporary: boolean;
  mode: string;
  source: unknown;
  created_at: string;
};

/** DB 시각('…+00:00')을 기기와 같은 ISO('…Z')로 */
const iso = (t: string) => new Date(t).toISOString();
const SOURCES: readonly MoodEntry['source'][] = ['daily', 'checkin', 'test'];

function toMood(row: MoodRow): MoodEntry | null {
  const source = SOURCES.find((s) => s === row.source);
  if (!isMoodId(row.mood) || !source) return null;
  return { day: row.day, mood: row.mood, source, ...(row.test_id ? { testId: row.test_id } : {}), ...(row.note ? { note: row.note } : {}), at: iso(row.at) };
}

function toSong(row: SongRow): Song | null {
  if (!isSongSource(row.source) || (row.mode !== 'sample' && row.mode !== 'suno')) return null;
  // 기기에서 만들 때와 같은 키 순서로 (바뀐 것 찾기를 JSON으로 비교한다)
  const source =
    row.source.kind === 'words' ? { kind: 'words' as const, words: row.source.words } : { kind: 'test' as const, testId: row.source.testId, resultId: row.source.resultId };
  return {
    id: row.id,
    title: row.title,
    audioUrl: row.audio_url,
    duration: row.duration,
    temporary: row.temporary,
    mode: row.mode,
    source,
    createdAt: iso(row.created_at),
    saved: true,
  };
}

/** 내 계정 기록 받아 오기 (RLS가 내 것만 준다) */
export async function pullRecords(supabase: SupabaseClient): Promise<Records> {
  const [profile, moods, tests, songs] = await Promise.all([
    supabase.from('profiles').select('nickname, birth_date, birth_time').maybeSingle(),
    supabase.from('mood_entries').select('day, mood, source, test_id, note, at').order('day', { ascending: false }),
    supabase.from('test_results').select('test_id, result_id, at').order('at', { ascending: false }),
    supabase.from('saved_songs').select('id, title, audio_url, duration, temporary, mode, source, created_at').order('created_at', { ascending: false }),
  ]);
  if (profile.error || moods.error || tests.error || songs.error) throw new Error('계정 기록을 불러오지 못했어요.');
  const p = profile.data as ProfileRow | null;
  return {
    profile: { nickname: p?.nickname ?? null, birth: p?.birth_date ? { date: p.birth_date, time: p.birth_time } : null },
    moods: (moods.data as MoodRow[]).flatMap((row) => toMood(row) ?? []),
    tests: (tests.data as TestRow[]).map((row) => ({ testId: row.test_id, resultId: row.result_id, at: iso(row.at) })),
    savedSongs: (songs.data as SongRow[]).flatMap((row) => toSong(row) ?? []),
  };
}

/** 바뀐 기록을 계정에 올린다. 하나라도 실패하면 throw (다음에 다시 맞춘다) */
export async function pushChanges(supabase: SupabaseClient, userId: string, c: RecordChanges): Promise<void> {
  const jobs: PromiseLike<{ error: unknown }>[] = [];
  if (c.profile) {
    jobs.push(
      supabase.from('profiles').upsert({
        user_id: userId,
        nickname: c.profile.nickname,
        birth_date: c.profile.birth?.date ?? null,
        birth_time: c.profile.birth?.time ?? null,
        updated_at: new Date().toISOString(),
      }),
    );
  }
  if (c.moods.length > 0) {
    jobs.push(
      supabase
        .from('mood_entries')
        .upsert(c.moods.map((m) => ({ user_id: userId, day: m.day, mood: m.mood, source: m.source, test_id: m.testId ?? null, note: m.note ?? null, at: m.at }))),
    );
  }
  if (c.tests.length > 0) {
    jobs.push(
      supabase
        .from('test_results')
        .upsert(c.tests.map((t) => ({ user_id: userId, test_id: t.testId, result_id: t.resultId, at: t.at })), { ignoreDuplicates: true }),
    );
  }
  if (c.songs.length > 0) {
    jobs.push(
      supabase.from('saved_songs').upsert(
        c.songs.map((s) => ({
          user_id: userId,
          id: s.id,
          title: s.title,
          audio_url: s.audioUrl,
          duration: s.duration,
          temporary: s.temporary,
          mode: s.mode,
          source: s.source,
          created_at: s.createdAt,
        })),
      ),
    );
  }
  if (c.removedSongIds.length > 0) jobs.push(supabase.from('saved_songs').delete().in('id', c.removedSongIds));
  const results = await Promise.all(jobs);
  if (results.some((r) => r.error)) throw new Error('계정에 기록을 저장하지 못했어요.');
}

/** 내 기록 지우기: 계정에 저장된 프로필·마음 기록·테스트 결과·저장한 노래를 모두 지운다 */
export async function deleteAllRecords(supabase: SupabaseClient, userId: string): Promise<void> {
  const results = await Promise.all(
    ['profiles', 'mood_entries', 'test_results', 'saved_songs'].map((table) => supabase.from(table).delete().eq('user_id', userId)),
  );
  if (results.some((r) => r.error)) throw new Error('기록을 지우지 못했어요. 잠시 뒤에 다시 해 주세요.');
}
