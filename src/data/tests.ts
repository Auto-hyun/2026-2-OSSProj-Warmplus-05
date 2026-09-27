import type { StageNo } from './stages';

/**
 * 심리테스트 3개. 모두 공개돼 자유롭게 쓸 수 있는 검증된 척도를 골라 우리말로 옮겼다.
 * - Brief COPE: 원작자가 척도 일부만 골라 쓰고 문장을 고쳐 써도 된다고 허락함
 * - WHO-5: CC BY-NC-SA 3.0 IGO (비영리·출처 표시·같은 조건으로 공유). 공식 한국어판이 없어 직접 옮김
 * - 로젠버그 자존감 척도: 퍼블릭 도메인, 출처 표시 요청
 */
export type TestResult = {
  id: string;
  name: string;
  emoji: string;
  /** 결과 카드 배경색 */
  tint: string;
  /** 결과 그림으로 쓸 오목이 단계 */
  stage: StageNo;
  summary: string;
  description: string;
  /** 이럴 땐 이렇게 */
  tips: string[];
  /** 마음 돌아보기 질문 */
  reflection: string;
  /** 마음이 많이 힘들 수 있는 결과: 도움 기관 안내를 함께 보여준다 */
  needsHelp?: boolean;
};

type Choice = { label: string; value: number };

type TestBase = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  tint: string;
  minutes: number;
  /** 문항 앞에 붙여 읽는 말 */
  prompt: string;
  choices: Choice[];
  source: { name: string; citation: string; note: string };
};

/** 문항마다 한 유형에 점수를 더해 가장 높은 유형을 보여준다 (같으면 results의 앞선 유형) */
export type TypeTest = TestBase & {
  kind: 'type';
  questions: { text: string; type: string }[];
  results: TestResult[];
};

/** 문항 점수를 더해(역문항은 거꾸로) multiplier를 곱한 점수가 min 이상인 첫 결과 (높은 순) */
export type ScoreTest = TestBase & {
  kind: 'score';
  questions: { text: string; reverse?: boolean }[];
  multiplier: number;
  results: (TestResult & { min: number })[];
};

export type PsychTest = TypeTest | ScoreTest;

const COPING: TypeTest = {
  id: 'coping',
  kind: 'type',
  title: '나의 스트레스 대처 유형',
  subtitle: '힘든 일이 생기면 나는 어떻게 버틸까?',
  emoji: '🧭',
  tint: '#E8F1E4',
  minutes: 2,
  prompt: '요즘 스트레스를 받는 일이 생기면 나는…',
  choices: [
    { label: '거의 안 해요', value: 1 },
    { label: '가끔 해요', value: 2 },
    { label: '자주 해요', value: 3 },
    { label: '거의 늘 해요', value: 4 },
  ],
  questions: [
    { text: '그 상황을 바꾸려고 내가 할 수 있는 일에 힘을 모아요', type: 'solver' },
    { text: '다른 사람에게서 마음의 지지를 받아요', type: 'sharer' },
    { text: '상황을 다른 눈으로, 조금 더 긍정적으로 보려고 해요', type: 'reframer' },
    { text: '일이나 다른 활동을 하며 생각을 딴 데로 돌려요', type: 'rester' },
    { text: '상황이 나아지도록 직접 행동해요', type: 'solver' },
    { text: '누군가에게 위로와 이해를 받아요', type: 'sharer' },
    { text: '지금 일어난 일에서도 좋은 점을 찾아봐요', type: 'reframer' },
    { text: '영화·책·잠·쇼핑처럼 덜 생각하게 해 주는 일을 해요', type: 'rester' },
    { text: '어떻게 할지 방법을 궁리해요', type: 'solver' },
    { text: '다른 사람에게 도움이나 조언을 구해요', type: 'sharer' },
    { text: '이미 일어난 일은 그대로 받아들여요', type: 'reframer' },
    { text: '그 일을 가볍게 웃어넘기려 해요', type: 'rester' },
  ],
  results: [
    {
      id: 'solver',
      name: '척척 해결형',
      emoji: '🛠️',
      tint: '#E4EEF8',
      stage: 4,
      summary: '문제가 생기면 소매부터 걷어붙여요',
      description:
        '스트레스를 받으면 원인을 찾아 직접 풀어 가는 편이에요. 계획을 세우고 움직이는 힘이 커서 주변에서도 든든하게 느낄 거예요. 다만 모든 걸 혼자 짊어지다 보면 금방 지칠 수 있어요.',
      tips: ['내 힘으로 바꿀 수 없는 일도 있다고 인정해 보기', '할 일 목록에 "쉬기"도 한 줄 적어 두기'],
      reflection: '요즘 혼자 해결하려고 애쓰는 일이 있나요?',
    },
    {
      id: 'sharer',
      name: '마음 나눔형',
      emoji: '🤝',
      tint: '#FBE7E4',
      stage: 3,
      summary: '힘들 땐 누군가와 나누며 힘을 얻어요',
      description:
        '스트레스를 받으면 믿는 사람에게 이야기하고 위로와 조언을 받으며 회복하는 편이에요. 도움을 청할 줄 아는 것도 큰 힘이에요. 가까운 사람에게 말하기 어려운 고민이라면 익명의 손편지도 좋은 방법이에요.',
      tips: ['마음을 나눌 사람을 한두 명 떠올려 두기', '말하기 어려운 고민은 온기우편함에 익명으로 보내 보기'],
      reflection: '요즘 가장 이야기하고 싶은 사람은 누구인가요?',
    },
    {
      id: 'reframer',
      name: '긍정 전환형',
      emoji: '🌈',
      tint: '#FFF4CC',
      stage: 5,
      summary: '같은 일도 다르게 보는 힘이 있어요',
      description:
        '힘든 일에서도 의미나 좋은 점을 찾고, 이미 일어난 일은 받아들이며 마음을 추스르는 편이에요. 회복이 빠른 편이지만, 괜찮은 척하느라 힘든 마음을 그냥 지나치지 않게 살펴 주세요.',
      tips: ['"그래도 힘들었어"라고 한 번은 인정해 주기', '오늘 좋았던 일 한 가지 적어 보기'],
      reflection: '힘들었지만 그래도 배운 게 있었던 일이 있나요?',
    },
    {
      id: 'rester',
      name: '잠깐 쉼표형',
      emoji: '☁️',
      tint: '#EDE7F6',
      stage: 2,
      summary: '잠시 멀어져서 숨을 고르는 편이에요',
      description:
        '스트레스를 받으면 다른 일을 하거나 가볍게 웃어넘기며 잠시 거리를 두는 편이에요. 지친 마음에 쉼표를 찍는 건 좋은 방법이에요. 다만 미뤄 둔 일은 충분히 쉰 뒤에 작게라도 다시 마주해 보세요.',
      tips: ['쉬는 시간을 정해 두고, 끝나면 작은 일 하나 해 보기', '산책이나 스트레칭처럼 몸을 쓰는 쉼 골라 보기'],
      reflection: '요즘 잠시 미뤄 둔 마음이 있나요?',
    },
  ],
  source: {
    name: 'Brief COPE',
    citation:
      "Carver, C. S. (1997). You want to measure coping but your protocol's too long: Consider the Brief COPE. International Journal of Behavioral Medicine, 4, 92-100.",
    note: '원작자가 척도 일부를 골라 쓰고 문장을 고쳐 써도 된다고 허락한 척도에서 12문항을 골라 우리말로 옮겼어요.',
  },
};

const WEATHER: ScoreTest = {
  id: 'weather',
  kind: 'score',
  title: '지금 내 마음 날씨',
  subtitle: '지난 2주, 내 마음은 어떤 날씨였을까?',
  emoji: '🌤️',
  tint: '#E4EEF8',
  minutes: 1,
  prompt: '지난 2주 동안…',
  choices: [
    { label: '늘 그랬어요', value: 5 },
    { label: '대부분 그랬어요', value: 4 },
    { label: '절반 넘게 그랬어요', value: 3 },
    { label: '절반이 안 되게 그랬어요', value: 2 },
    { label: '가끔 그랬어요', value: 1 },
    { label: '전혀 아니었어요', value: 0 },
  ],
  questions: [
    { text: '나는 즐겁고 기분이 좋았어요' },
    { text: '나는 차분하고 편안했어요' },
    { text: '나는 활기차고 힘이 넘쳤어요' },
    { text: '아침에 상쾌하고 개운하게 일어났어요' },
    { text: '내 일상은 관심 가는 일들로 채워져 있었어요' },
  ],
  multiplier: 4,
  results: [
    {
      id: 'sunny',
      min: 76,
      name: '맑음',
      emoji: '☀️',
      tint: '#FFF4CC',
      stage: 5,
      summary: '햇살 가득, 마음에 여유가 있어요',
      description:
        '지난 2주 동안 마음이 대체로 밝고 편안했어요. 지금의 좋은 흐름을 만들어 준 것들을 기억해 두면, 흐린 날에도 꺼내 쓸 수 있어요.',
      tips: ['요즘 나를 기분 좋게 한 것 세 가지 적어 두기', '이 여유를 가까운 사람과 나눠 보기'],
      reflection: '요즘 나를 가장 편안하게 해 준 건 무엇이었나요?',
    },
    {
      id: 'cloudy',
      min: 52,
      name: '구름 조금',
      emoji: '🌤️',
      tint: '#E8F1E4',
      stage: 3,
      summary: '대체로 괜찮지만 가끔 구름이 껴요',
      description:
        '마음이 대체로 괜찮지만 가끔 지치거나 가라앉는 날이 있었어요. 누구에게나 있는 자연스러운 날씨예요. 작은 쉼과 즐거움을 조금 더 챙겨 주세요.',
      tips: ['오늘의 미션처럼 작고 쉬운 활동 하나 해 보기', '잠드는 시간을 30분 앞당겨 보기'],
      reflection: '최근 마음에 구름이 끼었던 순간은 언제였나요?',
    },
    {
      id: 'overcast',
      min: 32,
      name: '흐림',
      emoji: '☁️',
      tint: '#EEF0F2',
      stage: 2,
      summary: '마음에 구름이 짙게 꼈어요',
      description:
        '지난 2주 동안 마음이 가라앉고 지친 날이 많았던 것 같아요. 이런 날이 이어진다면 마음 건강 자가검진이나 상담을 받아 보는 것도 좋아요. 혼자 견디지 않아도 괜찮아요.',
      tips: ['믿을 만한 사람에게 요즘 마음을 이야기해 보기', '국가정신건강정보포털에서 마음 건강 자가검진 해 보기'],
      reflection: '요즘 마음을 가장 무겁게 하는 건 무엇인가요?',
    },
    {
      id: 'rainy',
      min: 0,
      name: '비',
      emoji: '🌧️',
      tint: '#E6E4F2',
      stage: 1,
      needsHelp: true,
      summary: '마음에 비가 오고 있어요',
      description:
        '지난 2주 동안 마음이 많이 힘들었던 것 같아요. 이 점수는 전문가와 이야기해 보기를 권하는 정도예요. 혼자 견디지 말고 아래 도움받을 수 있는 곳에 연락해 주세요.',
      tips: ['가까운 정신건강복지센터나 병원에서 상담받아 보기', '지금 많이 힘들다면 109(24시간)에 전화하기'],
      reflection: '지금 나에게 가장 필요한 도움은 어떤 건가요?',
    },
  ],
  source: {
    name: 'WHO-5 웰빙 지수',
    citation: 'World Health Organization. The World Health Organization-Five Well-Being Index (WHO-5). Geneva: WHO; 2024. CC BY-NC-SA 3.0 IGO.',
    note: '온기가 우리말로 옮긴 것으로, 세계보건기구가 만든 번역이 아니며 번역의 내용과 정확성은 세계보건기구가 책임지지 않아요. 점수 기준(50점 이하 점검 권유, 28점 이하 상담 권유)은 원작을 따랐어요.',
  },
};

const SELF_ESTEEM: ScoreTest = {
  id: 'self-esteem',
  kind: 'score',
  title: '나의 자존감 온도',
  subtitle: '나는 나를 얼마나 따뜻하게 바라보고 있을까?',
  emoji: '🌡️',
  tint: '#FBE7E4',
  minutes: 2,
  prompt: '요즘의 나를 떠올리며…',
  choices: [
    { label: '매우 그래요', value: 3 },
    { label: '그래요', value: 2 },
    { label: '그렇지 않아요', value: 1 },
    { label: '전혀 그렇지 않아요', value: 0 },
  ],
  questions: [
    { text: '나는 대체로 나 자신에게 만족해요' },
    { text: '가끔은 내가 전혀 괜찮지 않은 사람 같아요', reverse: true },
    { text: '나에게는 좋은 점이 여러 가지 있다고 느껴요' },
    { text: '나는 다른 사람들만큼 일을 잘 해낼 수 있어요' },
    { text: '나에게는 자랑할 만한 게 별로 없다고 느껴요', reverse: true },
    { text: '가끔 내가 쓸모없다고 느껴요', reverse: true },
    { text: '나는 적어도 다른 사람들만큼 가치 있는 사람이라고 느껴요' },
    { text: '내가 나를 좀 더 존중할 수 있으면 좋겠어요', reverse: true },
    { text: '대체로 나는 실패한 사람이라고 느끼는 편이에요', reverse: true },
    { text: '나는 나 자신을 긍정적으로 바라봐요' },
  ],
  multiplier: 1,
  results: [
    {
      id: 'warm',
      min: 26,
      name: '따끈따끈',
      emoji: '☕',
      tint: '#FDEBD3',
      stage: 5,
      summary: '나를 따뜻하게 믿어 주고 있어요',
      description:
        '나 자신을 있는 그대로 받아들이고 아끼는 마음이 커요. 이 따뜻함은 힘든 일이 있을 때 다시 일어서게 해 주는 힘이 돼요.',
      tips: ['오늘 나를 칭찬할 일 한 가지 찾아보기', '그 따뜻함을 주변 사람에게도 나눠 보기'],
      reflection: '내가 나를 가장 좋아하는 순간은 언제인가요?',
    },
    {
      id: 'cozy',
      min: 15,
      name: '포근',
      emoji: '🧣',
      tint: '#FFF4CC',
      stage: 3,
      summary: '대체로 나를 괜찮게 여기고 있어요',
      description:
        '스스로를 대체로 괜찮은 사람으로 여기지만, 가끔은 자신이 없어지는 날도 있어요. 누구나 그래요. 잘한 일을 작게라도 알아봐 주면 온도가 조금씩 올라가요.',
      tips: ['하루 끝에 잘한 일 한 가지 적기', '나에게 하는 말을 친구에게 하듯 다정하게 바꿔 보기'],
      reflection: '요즘 나에게 해 주고 싶은 말이 있나요?',
    },
    {
      id: 'chilly',
      min: 0,
      name: '쌀쌀',
      emoji: '🍂',
      tint: '#EEF0F2',
      stage: 1,
      summary: '요즘 나에게 조금 차갑게 대하고 있어요',
      description:
        '요즘 스스로를 모질게 평가하거나 자신이 없어지는 때가 많은 것 같아요. 내가 부족해서가 아니라 지금 많이 지쳐 있다는 신호일 수 있어요. 따뜻한 말이 필요할 땐 온기우편함에 이야기를 보내 보세요.',
      tips: ['요즘 잘 버텨 낸 일을 하나 떠올려 보기', '온기우편함에 익명으로 고민을 보내 손편지 답장 받기'],
      reflection: '요즘 나를 가장 작아지게 만드는 건 무엇인가요?',
    },
  ],
  source: {
    name: '로젠버그 자존감 척도',
    citation: 'Rosenberg, M. (1965). Society and the adolescent self-image. Princeton, NJ: Princeton University Press.',
    note: '퍼블릭 도메인 척도를 온기가 우리말로 옮겼어요. 점수 기준(15점 미만 낮음, 26점 이상 높음)은 흔히 쓰는 해석을 따랐어요.',
  },
};

export const TESTS: readonly PsychTest[] = [COPING, WEATHER, SELF_ESTEEM];

export function getTest(id: string): PsychTest | undefined {
  return TESTS.find((t) => t.id === id);
}

export function getTestResult(test: PsychTest, resultId: string): TestResult | undefined {
  return test.results.find((r) => r.id === resultId);
}
