import type { CategoryId } from './categories';

/**
 * 처음 방문 시작 화면 "먼저 도착한 편지"의 문구·질문 (팀 시안 먼저_도착한_편지_시작화면.html 그대로).
 * 질문은 진단이 아니라 닮은 온기레터를 고르고 안전 안내 여부를 정하는 데만 쓴다.
 * 문구의 {name}·{name:이/가} 자리는 지은 이름으로 채운다 (withBirdName).
 */

export type IntroPose =
  | 'peek'
  | 'fly'
  | 'hello'
  | 'carry'
  | 'lie'
  | 'back'
  | 'question'
  | 'music'
  | 'search'
  | 'mailman'
  | 'heart'
  | 'smile'
  | 'egg'
  | 'mailbox'
  | 'wings'
  | 'book';

export const poseSrc = (pose: IntroPose) => `/intro/${pose}.webp`;

/** 포즈 그림 원본 크기 (가로, 세로) */
export const POSE_SIZE: Record<IntroPose, [number, number]> = {
  peek: [127, 205],
  fly: [300, 191],
  hello: [169, 204],
  carry: [217, 175],
  lie: [228, 107],
  back: [158, 190],
  question: [162, 198],
  music: [198, 163],
  search: [229, 158],
  mailman: [249, 183],
  heart: [179, 199],
  smile: [228, 168],
  egg: [279, 236],
  mailbox: [219, 300],
  wings: [186, 193],
  book: [173, 162],
};

export type IntroTopicId = 'work' | 'career' | 'relation' | 'love' | 'burnout' | 'esteem' | 'family' | 'lonely';

export type IntroTopic = {
  id: IntroTopicId;
  emoji: string;
  label: string;
  /** 선택지에 붙는 예시 고민 */
  example: string;
  /** 온기레터 분류 */
  category: CategoryId;
  /** 이 주제에 보여줄 실제 온기레터 (제목이 고민, 미리보기가 답장 구절인 편지로 골랐다) */
  letterId: number;
};

type Choice = { label: string; w: number; reaction: string };
export type SkyKind = 'sun' | 'part' | 'cloud' | 'rain';

type Base = { id: string; lead: string; title: string; sub?: string };
export type IntroQuestion =
  | (Base & { kind: 'pics'; options: (Choice & { pose: IntroPose })[] })
  | (Base & { kind: 'list'; options: (Choice & { emoji: string })[] })
  | (Base & { kind: 'sky'; options: (Choice & { sky: SkyKind })[] })
  | (Base & {
      kind: 'chat';
      from: { name: string; message: string };
      options: (Choice & { flag?: 'alone' })[];
    })
  | (Base & { kind: 'battery' })
  | (Base & { kind: 'topics'; options: IntroTopic[] });

export const INTRO_TOPICS: readonly IntroTopic[] = [
  {
    id: 'work',
    emoji: '💼',
    label: '일·학업',
    example: '열심히 하는데 잘하고 있는지 모르겠어요.',
    category: 'work',
    letterId: 2426676,
  },
  {
    id: 'career',
    emoji: '🧭',
    label: '진로·미래',
    example: '앞으로 뭘 해야 할지 막막해요.',
    category: 'career',
    letterId: 3056252,
  },
  {
    id: 'relation',
    emoji: '👥',
    label: '인간관계',
    example: '사람들과 함께 있어도 자꾸 지쳐요.',
    category: 'relationship',
    letterId: 3032358,
  },
  {
    id: 'love',
    emoji: '❤️',
    label: '연애·이별',
    example: '끝난 관계인데도 자꾸 생각나요.',
    category: 'love',
    letterId: 2764891,
  },
  {
    id: 'burnout',
    emoji: '🌧',
    label: '무기력·번아웃',
    example: '아무것도 하고 싶지 않은 날이 많아졌어요.',
    category: 'anxiety',
    letterId: 2829121,
  },
  {
    id: 'esteem',
    emoji: '🪞',
    label: '자존감·비교',
    example: '자꾸 다른 사람과 나를 비교하게 돼요.',
    category: 'self',
    letterId: 3374176,
  },
  {
    id: 'family',
    emoji: '🏠',
    label: '가족',
    example: '가족이라 더 말하기 어려운 고민이 있어요.',
    category: 'family',
    letterId: 2394015,
  },
  {
    id: 'lonely',
    emoji: '🌙',
    label: '외로움',
    example: '내 이야기를 편하게 할 사람이 없는 것 같아요.',
    category: 'loneliness',
    letterId: 3475151,
  },
];

export const INTRO_QUESTIONS: readonly IntroQuestion[] = [
  {
    id: 'q1',
    kind: 'pics',
    lead: '{name:이/가} 물어온 첫 번째 질문',
    title: '퇴근하고 집에 온 나,\n제일 닮은 {name:은/는}?',
    sub: '학교나 알바를 마친 뒤도 괜찮아요.',
    options: [
      {
        pose: 'lie',
        label: '바닥에 녹아내림',
        w: 3,
        reaction: '녹아내린 날엔 그냥 녹아 있어도 돼.',
      },
      {
        pose: 'back',
        label: '아무도 날 안 봤으면',
        w: 2,
        reaction: '혼자 있고 싶은 날도 있지. 조용히 옆에 있을게.',
      },
      {
        pose: 'question',
        label: '멍… 뭐 하려고 했더라',
        w: 1,
        reaction: '멍한 것도 마음이 쉬는 방법이래.',
      },
      {
        pose: 'music',
        label: '흥얼흥얼, 나름 괜찮아',
        w: 0,
        reaction: '흥얼거리는 저녁이라니, 좋다!',
      },
    ],
  },
  {
    id: 'q2',
    kind: 'list',
    lead: '두 번째 질문을 물고 왔어',
    title: '주말 아침, 알람 없이 눈을 떴어요.\n제일 먼저 드는 생각은?',
    options: [
      {
        emoji: '☀️',
        label: '오늘 뭐 하지? 살짝 설렌다',
        w: 0,
        reaction: '설레는 아침이라니, 부러워!',
      },
      {
        emoji: '🏃',
        label: '뭐라도 해야 하는데… 마음만 바쁘다',
        w: 1,
        reaction: '쉬는 날에도 마음이 먼저 달려가는구나.',
      },
      {
        emoji: '📅',
        label: '벌써 월요일 생각에 한숨이 난다',
        w: 2,
        reaction: '주말까지 월요일이 따라왔구나.',
      },
      {
        emoji: '🛌',
        label: '눈 뜨는 것부터 버겁다',
        w: 3,
        reaction: '눈 뜨는 것도 힘든 날이 있어. 알려줘서 고마워.',
      },
    ],
  },
  {
    id: 'q3',
    kind: 'sky',
    lead: '이번엔 창밖을 보고 왔어',
    title: '지금 내 마음의 창밖은\n어떤 날씨야?',
    options: [
      {
        sky: 'sun',
        label: '맑음',
        w: 0,
        reaction: '맑은 창이구나. {name}도 날개가 가벼워.',
      },
      {
        sky: 'part',
        label: '구름 조금',
        w: 1,
        reaction: '구름이 조금 지나가는 중이구나.',
      },
      {
        sky: 'cloud',
        label: '흐림',
        w: 2,
        reaction: '흐린 날은 불을 하나 더 켜두자.',
      },
      {
        sky: 'rain',
        label: '비',
        w: 3,
        reaction: '비 오는 창이구나. 우산은 {name:이/가} 씌워줄게.',
      },
    ],
  },
  {
    id: 'q4',
    kind: 'chat',
    lead: '친구한테 메시지가 왔대',
    title: '친구가 이렇게 물어보면,\n나는 뭐라고 답해?',
    from: { name: '대학 동기 민지', message: '요즘 어때? 잘 지내? 🙂' },
    options: [
      { label: '나름 잘 지내! 너는?', w: 0, reaction: '잘 지낸다니 다행이다.' },
      {
        label: '그냥 바쁘지 뭐 ㅋㅋ',
        w: 1,
        reaction: '바쁜 와중에 여기까지 와줘서 고마워.',
      },
      {
        label: '괜찮은 척 웃고 넘겨',
        w: 2,
        reaction: '괜찮은 척하느라 조금 지쳤겠다.',
      },
      {
        label: '사실… 물어봐 줄 사람이 별로 없어',
        w: 3,
        flag: 'alone',
        reaction: '그럼 오늘은 {name:이/가} 물어볼게. 요즘 어때?',
      },
    ],
  },
  {
    id: 'q5',
    kind: 'battery',
    lead: '{name:이/가} 배터리를 들고 왔어',
    title: '오늘 마음 배터리,\n몇 칸 남았어?',
    sub: '칸을 눌러서 채워주세요.',
  },
  {
    id: 'q6',
    kind: 'topics',
    lead: '마지막 질문이야',
    title: '요즘 마음에 가장 오래\n머물러 있는 고민은?',
    sub: '가장 가까운 하나만 골라주세요.',
    options: [...INTRO_TOPICS],
  },
];

export const BATTERY_LEVELS = [
  {
    n: 1,
    w: 3,
    label: '1칸, 거의 방전이야',
    reaction: '1칸이면 오늘은 충전만 해도 충분해.',
  },
  {
    n: 2,
    w: 2,
    label: '2칸, 아껴 써야 해',
    reaction: '2칸으로 여기까지 온 거, 대단한 거야.',
  },
  {
    n: 3,
    w: 1,
    label: '3칸, 반쯤 남았어',
    reaction: '반쯤이면 오늘 하루 잘 버티는 중이구나.',
  },
  {
    n: 4,
    w: 1,
    label: '4칸, 그럭저럭 괜찮아',
    reaction: '그럭저럭 괜찮은 날, 좋다.',
  },
  {
    n: 5,
    w: 0,
    label: '5칸, 가득 찼어',
    reaction: '가득 찬 날엔 그 온기를 누군가에게 나눠줘도 좋아.',
  },
] as const;

/** 오목이와 인사 (스크롤하며 한 줄씩) */
export const MEET_LINES: readonly {
  lines: string[];
  sub: string;
  pose: IntroPose;
}[] = [
  {
    lines: ['안녕, 나는 {name:이야/야}.'],
    sub: '온기우편함 근처에 사는 흰머리오목눈이.',
    pose: 'hello',
  },
  {
    lines: ['사람들이 온기우편함에 넣은', '편지를 부지런히 날라.'],
    sub: '오늘은 그중에 너한테 온 게 있어.',
    pose: 'carry',
  },
  {
    lines: ['편지를 고르기 전에,', '질문 여섯 개만 물어볼게.'],
    sub: '진단이 아니라, 너와 닮은 편지를 찾기 위한 질문이야.',
    pose: 'question',
  },
];

export const SEARCH_LINES: readonly string[][] = [
  ['잠깐만,', '편지함에 다녀올게.'],
  ['너랑 닮은 마음을 먼저', '꺼내놓은 사람이 있었는데…'],
  ['찾았다!'],
];

/** 편지를 건네며 하는 말 (안내 단계별) */
export const ARRIVE_LINES: Record<1 | 2 | 3, string> = {
  1: '오늘은 제법 괜찮은 날이구나. 그래도 한 통 가져왔어.',
  2: '비슷한 마음을 먼저 꺼내놓은 사람이 있었어.',
  3: '오늘 많이 지쳐 보여서, 제일 따뜻한 편지로 골라왔어.',
};
