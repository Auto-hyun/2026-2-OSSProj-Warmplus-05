import { INTRO_TOPICS, type IntroTopicId } from '@/data/intro';
import { josa } from './josa';
import type { Letter } from './letters';

/** 시작 화면 문구의 {name} 자리에 지은 이름을 넣는다. {name:이/가}처럼 쓰면 받침에 맞는 조사를 붙인다 */
export function withBirdName(text: string, name: string): string {
  return text.replace(/\{name(?::([^}]+))?\}/g, (_, pair?: string) => (pair ? josa(name, pair as `${string}/${string}`) : name));
}

export type IntroAnswer = {
  w: number;
  flag?: 'alone';
  battery?: number;
  topic?: IntroTopicId;
};

export type IntroResult = {
  /** 앞의 다섯 질문 점수 합 (0~15) */
  score: number;
  /** 1 가벼움: 편지만 · 2 보통 · 3 세심히: 편지와 24시간 도움 기관을 함께 안내 */
  tier: 1 | 2 | 3;
  topic: IntroTopicId;
};

/** 시작 화면 답으로 편지와 안전 안내 단계를 정한다 (사용자에게 라벨로 보여주지 않는다) */
export function classifyIntro(answers: Partial<Record<string, IntroAnswer>>): IntroResult {
  const score = ['q1', 'q2', 'q3', 'q4', 'q5'].reduce((sum, id) => sum + (answers[id]?.w ?? 0), 0);
  const alone = answers.q4?.flag === 'alone';
  const lowBattery = (answers.q5?.battery ?? 5) <= 1;
  const rainy = answers.q3?.w === 3;
  const tier = score >= 10 || (alone && lowBattery) || (lowBattery && rainy) ? 3 : score >= 5 ? 2 : 1;
  return { score, tier, topic: answers.q6?.topic ?? 'burnout' };
}

const bySentDesc = (a: Letter, b: Letter) => b.sentAt.localeCompare(a.sentAt);

/** 주제에 맞는 실제 온기레터. 고른 편지가 아카이브에서 빠졌으면 같은 분류의 가장 최근 편지 */
export function introLetterFor(topicId: IntroTopicId, letters: readonly Letter[]): Letter {
  const topic = INTRO_TOPICS.find((t) => t.id === topicId) ?? INTRO_TOPICS[0];
  return (
    letters.find((l) => l.id === topic.letterId) ??
    letters.filter((l) => l.category === topic.category && l.preview).sort(bySentDesc)[0] ??
    [...letters].sort(bySentDesc)[0]
  );
}
