import { getMood } from '@/data/moods';
import { getTest, getTestResult } from '@/data/tests';
import type { AppState } from '@/lib/storage/types';

/** 오목이가 대답할 때 참고하는 나에 대한 정보. 대화 서버(/api/chat)로 이것만 보낸다 */
export type ChatContext = {
  note: string | null;
  /** 최근 14일 기분, 최근 날이 앞 ('2026-10-18 비(슬픔) 메모: …') */
  moods: string[];
  /** 최근 테스트 결과 5개 */
  tests: string[];
  /** 최근 대화 20줄, 오래된 것이 앞 */
  messages: { role: 'user' | 'omok'; text: string }[];
};

export const RECENT_MOOD_DAYS = 14;
export const RECENT_MESSAGES = 20;

export function buildChatContext(state: AppState): ChatContext {
  return {
    note: state.chat.note?.summary ?? null,
    moods: state.moods.slice(0, RECENT_MOOD_DAYS).map((m) => {
      const mood = getMood(m.mood);
      return `${m.day} ${mood.weather}(${mood.label})${m.note ? ` 메모: ${m.note}` : ''}`;
    }),
    tests: state.tests.slice(0, 5).flatMap((t) => {
      const test = getTest(t.testId);
      const result = test && getTestResult(test, t.resultId);
      return test && result ? [`${t.at.slice(0, 10)} ${test.title}: ${result.name}`] : [];
    }),
    messages: state.chat.messages.slice(-RECENT_MESSAGES).map(({ role, text }) => ({ role, text })),
  };
}
