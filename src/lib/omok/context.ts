import { getMood } from '@/data/moods';
import { getTest, getTestResult } from '@/data/tests';
import { todayKey, type DayKey } from '@/lib/date';
import { fortuneFor } from '@/lib/fortune';
import { sourceLabel } from '@/lib/songs';
import type { AppState, Song } from '@/lib/storage/types';

/** 오목이가 대답할 때 참고하는 나에 대한 정보. 대화 서버(/api/chat)로 이것만 보낸다 */
export type ChatContext = {
  note: string | null;
  /** 마이페이지 닉네임 */
  nickname: string | null;
  /** 최근 14일 기분, 최근 날이 앞 ('2026-10-18 비(슬픔) 메모: …') */
  moods: string[];
  /** 최근 테스트 결과 5개 ('2026-11-17 나의 마음 소리 유형: 조용한 빗소리 (결과 요약)') */
  tests: string[];
  /** 가장 최근 테스트에서 문항별로 고른 답 ('문항 → 고른 답') */
  answers: string[];
  /** 최근 노래 만들기 5번과 그중 저장한 곡 */
  songs: string[];
  /** 생일을 넣었으면 오늘의 오하아사 */
  fortune: string | null;
  /** 최근 대화 20줄, 오래된 것이 앞 */
  messages: { role: 'user' | 'omok'; text: string }[];
};

export const RECENT_MOOD_DAYS = 14;
export const RECENT_MESSAGES = 20;
const RECENT_TESTS = 5;
const RECENT_ANSWERS = 6;
const RECENT_COMPOSES = 5;

/** 서버가 받는 맥락의 길이 제한: 화면이 보낸 값을 그대로 믿지 않는다 (API 비용 폭주·잘못된 요청 막기) */
export const NOTE_MAX = 1000;
const NICKNAME_MAX = 12;
const LINE_MAX = 300;
const MESSAGE_MAX = 1000;

/** 기록 시각(ISO)의 한국 날짜. 기분 기록(day)과 같은 기준으로 맞춘다 */
const koreanDay = (iso: string) => todayKey(new Date(iso));

/** 한 번 작곡하면 같은 시각에 2곡이 생긴다: 작곡 한 번을 한 줄로 */
function composeLines(songs: Song[]): string[] {
  const composes = new Map<string, Song[]>();
  for (const song of songs) composes.set(song.createdAt, [...(composes.get(song.createdAt) ?? []), song]);
  return [...composes.values()].slice(0, RECENT_COMPOSES).map((group) => {
    const saved = group.filter((s) => s.saved).map((s) => `「${s.title}」`);
    return `${koreanDay(group[0].createdAt)} 노래 만들기 (${sourceLabel(group[0])}) · ${saved.length ? `저장한 곡: ${saved.join(', ')}` : '저장 안 함'}`;
  });
}

const cut = (text: string, max: number) => (text.length > max ? text.slice(0, max) : text);
const textOf = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? cut(v, max) : null);
const linesOf = (v: unknown, count: number) =>
  Array.isArray(v)
    ? v
        .filter((line): line is string => typeof line === 'string')
        .slice(0, count)
        .map((line) => cut(line, LINE_MAX))
    : [];

/** 화면이 보낸 대화 줄: user·omok 말고는 버리고, 길이를 잘라 최근 count줄만 받는다 (서버) */
export function parseMessages(raw: unknown, count: number): ChatContext['messages'] {
  if (!Array.isArray(raw)) return [];
  return raw
    .flatMap((m): ChatContext['messages'] => {
      const { role, text } = (m ?? {}) as { role?: unknown; text?: unknown };
      return (role === 'user' || role === 'omok') && typeof text === 'string' ? [{ role, text: cut(text, MESSAGE_MAX) }] : [];
    })
    .slice(-count);
}

/** 화면이 보낸 맥락을 모양 검사하고 길이를 잘라서 받는다 (서버). 모르는 값은 버린다 */
export function parseChatContext(raw: unknown): ChatContext {
  const c = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  return {
    note: textOf(c.note, NOTE_MAX),
    nickname: textOf(c.nickname, NICKNAME_MAX),
    moods: linesOf(c.moods, RECENT_MOOD_DAYS),
    tests: linesOf(c.tests, RECENT_TESTS),
    answers: linesOf(c.answers, RECENT_ANSWERS),
    songs: linesOf(c.songs, RECENT_COMPOSES),
    fortune: textOf(c.fortune, LINE_MAX),
    messages: parseMessages(c.messages, RECENT_MESSAGES),
  };
}

export function buildChatContext(state: AppState, today: DayKey = todayKey()): ChatContext {
  const birth = state.profile.birth;
  const fortune = birth && fortuneFor(birth, today);
  return {
    note: state.chat.note?.summary ?? null,
    nickname: state.profile.nickname,
    moods: state.moods.slice(0, RECENT_MOOD_DAYS).map((m) => {
      const mood = getMood(m.mood);
      return `${m.day} ${mood.weather}(${mood.label})${m.note ? ` 메모: ${m.note}` : ''}`;
    }),
    tests: state.tests.slice(0, RECENT_TESTS).flatMap((t) => {
      const test = getTest(t.testId);
      const result = test && getTestResult(test, t.resultId);
      return test && result ? [`${koreanDay(t.at)} ${test.title}: ${result.name} (${result.summary})`] : [];
    }),
    answers: (state.tests.find((t) => t.answers?.length)?.answers ?? []).slice(0, RECENT_ANSWERS).map((a) => `${a.q} → ${a.a}`),
    songs: composeLines(state.songs),
    fortune: fortune
      ? `${fortune.zodiac.name} ${fortune.rank}위(${fortune.rankLabel}) · ${fortune.luck} · ${fortune.advice} · 럭키 아이템 ${fortune.item.name}, 럭키 컬러 ${fortune.color.name}`
      : null,
    messages: state.chat.messages.slice(-RECENT_MESSAGES).map(({ role, text }) => ({ role, text })),
  };
}
