import type { MoodId } from './moods';
import type { MoodFamily } from './music';
import { MIND_STATE_TESTS } from './tests/mindState';
import { REST_TESTS } from './tests/rest';
import { COMFORT_TESTS } from './tests/comfort';
import { MUSIC_TESTS } from './tests/musicTests';
import { VILLAGE_TESTS } from './tests/village';

/**
 * 심리테스트. 테스트 데이터는 tests/ 폴더에 그룹별로 나눠 두고 여기서 합친다.
 * 새 테스트는 같은 모양으로 만들어 해당 그룹 파일에 더한다.
 */
export type TestResult = {
  id: string;
  name: string;
  emoji: string;
  summary: string;
  description: string;
  /** 이 유형으로 노래를 만들 때 쓰는 음악: 감정 갈래 + 더할 느낌(Suno style) */
  music: { family: MoodFamily; style: string };
  /** 이 결과를 오늘 기분(유리병 구슬)으로도 기록할 때의 감정. 없으면 기록 안 함 */
  mood?: MoodId;
};

export type TestQuestion = {
  text: string;
  /** 고르면 type 유형에 1점 */
  choices: { label: string; type: string }[];
};

/** 마음 테스트 숲 목록의 분류: 가볍게 / 나를 돌아보기 */
export type TestCategory = 'light' | 'reflect';

export type PsychTest = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  /** 목록 카드: 걸리는 시간(분), 한 줄 꼬리표, 분류, 썸네일 그림 경로 */
  minutes: number;
  tag: string;
  category: TestCategory;
  thumb: string;
  questions: TestQuestion[];
  /** 점수가 같으면 앞에 있는 유형이 결과가 된다 */
  results: TestResult[];
};

export const TESTS: readonly PsychTest[] = [
  ...MIND_STATE_TESTS,
  ...REST_TESTS,
  ...COMFORT_TESTS,
  ...MUSIC_TESTS,
  ...VILLAGE_TESTS,
];

/** 시안에는 있지만 문항이 아직 없는 테스트. 목록에 '준비 중'으로만 보인다 */
export const UPCOMING_TESTS: readonly Pick<PsychTest, 'title' | 'minutes' | 'tag' | 'category' | 'thumb'>[] = [];

export function getTest(id: string): PsychTest | undefined {
  return TESTS.find((t) => t.id === id);
}

export function getTestResult(test: PsychTest, resultId: string): TestResult | undefined {
  return test.results.find((r) => r.id === resultId);
}
