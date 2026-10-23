import type { MoodFamily } from './music';

/**
 * 심리테스트. 지금은 틀만 있는 예시 테스트 하나뿐이다.
 * 문항(questions)·선택지(choices)·유형(results)의 글을 채우고, 유형마다 어울리는 음악(music)을 정하면 된다.
 * 새 테스트는 같은 모양으로 만들어 TESTS에 더한다.
 */
export type TestResult = {
  id: string;
  name: string;
  emoji: string;
  summary: string;
  description: string;
  /** 이 유형으로 노래를 만들 때 쓰는 음악: 감정 갈래 + 더할 느낌(Suno style) */
  music: { family: MoodFamily; style: string };
};

export type TestQuestion = {
  text: string;
  /** 고르면 type 유형에 1점 */
  choices: { label: string; type: string }[];
};

export type PsychTest = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  questions: TestQuestion[];
  /** 점수가 같으면 앞에 있는 유형이 결과가 된다 */
  results: TestResult[];
};

const EXAMPLE: PsychTest = {
  id: 'example',
  title: '나의 마음 소리 유형 (예시)',
  subtitle: '틀만 있는 예시 테스트예요. 문항과 유형을 채워 주세요',
  emoji: '🎧',
  questions: [1, 2, 3].map((n) => ({
    text: `예시 질문 ${n} — 여기에 질문을 적어 주세요`,
    choices: [
      { label: '예시 답 A', type: 'a' },
      { label: '예시 답 B', type: 'b' },
      { label: '예시 답 C', type: 'c' },
      { label: '예시 답 D', type: 'd' },
    ],
  })),
  results: [
    {
      id: 'a',
      name: '예시 유형 A',
      emoji: '🌿',
      summary: '유형 한 줄 소개를 적어 주세요',
      description: '유형 설명을 적어 주세요. 이 유형은 잔잔한 곡으로 만들어져요.',
      music: { family: 'calm', style: 'forest morning, birdsong-like flute' },
    },
    {
      id: 'b',
      name: '예시 유형 B',
      emoji: '🌧️',
      summary: '유형 한 줄 소개를 적어 주세요',
      description: '유형 설명을 적어 주세요. 이 유형은 차분하고 촉촉한 곡으로 만들어져요.',
      music: { family: 'sad', style: 'rainy window, soft cello' },
    },
    {
      id: 'c',
      name: '예시 유형 C',
      emoji: '🌪️',
      summary: '유형 한 줄 소개를 적어 주세요',
      description: '유형 설명을 적어 주세요. 이 유형은 답답함이 풀리는 곡으로 만들어져요.',
      music: { family: 'stress', style: 'wind clearing the sky' },
    },
    {
      id: 'd',
      name: '예시 유형 D',
      emoji: '☀️',
      summary: '유형 한 줄 소개를 적어 주세요',
      description: '유형 설명을 적어 주세요. 이 유형은 밝고 신나는 곡으로 만들어져요.',
      music: { family: 'happy', style: 'sunny picnic, whistling melody' },
    },
  ],
};

export const TESTS: readonly PsychTest[] = [EXAMPLE];

export function getTest(id: string): PsychTest | undefined {
  return TESTS.find((t) => t.id === id);
}

export function getTestResult(test: PsychTest, resultId: string): TestResult | undefined {
  return test.results.find((r) => r.id === resultId);
}
