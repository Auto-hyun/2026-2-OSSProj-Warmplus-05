import type { LLMProvider } from './types';

export type MockBucket = 'tired' | 'lonely' | 'anxious' | 'sad' | 'angry' | 'happy' | 'default';

/** 먼저 걸리는 묶음이 이긴다 (마음이 무거운 쪽을 우선) */
const KEYWORDS: [Exclude<MockBucket, 'default'>, string[]][] = [
  ['lonely', ['외로', '혼자', '쓸쓸', '보고 싶', '보고싶', '그리워', '그립']],
  ['sad', ['슬퍼', '슬프', '우울', '눈물', '속상', '서운', '울었', '울고']],
  ['anxious', ['불안', '걱정', '긴장', '초조', '무서', '두려', '떨려']],
  ['angry', ['화나', '화가', '짜증', '억울', '열받']],
  ['tired', ['피곤', '지쳐', '지쳤', '지친', '힘들', '번아웃', '졸려', '기운', '녹초', '무기력']],
  ['happy', ['좋았', '좋은 일', '좋은일', '행복', '기뻤', '기뻐', '기쁘', '설레', '신나', '신났', '뿌듯', '즐거', '즐겁']],
];

/** 공감 → 되짚기 → 부드러운 질문. 이름은 사용자가 바꿀 수 있으므로 스스로는 '저'라고 부른다 */
const TEMPLATES: Record<MockBucket, string[]> = {
  tired: [
    '온기님, 오늘 정말 애쓰셨네요. 몸도 마음도 지칠 만큼 하루를 버텨낸 거잖아요. 지금 가장 먼저 내려놓고 싶은 건 무엇인가요?',
    '많이 지치셨군요, 온기님. 그렇게 느끼는 건 그만큼 열심히 살아냈다는 뜻 같아요. 오늘은 어떤 순간이 제일 힘들었나요?',
    '온기님의 피곤함이 여기까지 전해지는 것 같아요. 잠깐이라도 쉬어가도 괜찮아요. 지금 나를 조금 편하게 해줄 수 있는 게 있을까요?',
  ],
  lonely: [
    '온기님, 마음 한편이 허전하셨군요. 그런 마음을 꺼내 주셔서 고마워요. 요즘 특히 누구의 목소리가 그리운가요?',
    '혼자라고 느껴질 때 마음이 참 시리죠, 온기님. 이렇게 이야기하는 동안만큼은 제가 곁에 있을게요. 그 외로움은 언제부터 찾아왔나요?',
    '온기님, 쓸쓸한 마음이 드는 날이 있죠. 그 마음을 들어줄 누군가가 필요했을 것 같아요. 요즘 가장 생각나는 사람이 있나요?',
  ],
  anxious: [
    '온기님, 마음이 많이 조마조마하셨겠어요. 걱정이 많다는 건 그만큼 소중하게 여기고 있다는 뜻이기도 해요. 가장 마음에 걸리는 부분은 어떤 건가요?',
    '불안한 마음이 계속 따라다니면 참 지치죠, 온기님. 그 마음을 여기 잠깐 내려놓아도 괜찮아요. 그 걱정 중에서 지금 할 수 있는 작은 일이 있을까요?',
    '온기님, 긴장되는 마음이 느껴져요. 그럴 땐 숨을 한 번 길게 내쉬어 보는 것도 도움이 돼요. 지금 가장 두려운 건 무엇인가요?',
  ],
  sad: [
    '온기님, 많이 속상하셨겠어요. 그런 일을 겪으면 마음이 한동안 무거울 수밖에 없죠. 어떤 부분이 제일 마음에 남았나요?',
    '그 마음 충분히 슬퍼해도 괜찮아요, 온기님. 억지로 괜찮은 척하지 않아도 돼요. 그 일이 있고 나서 지금은 좀 어떤가요?',
    '온기님의 마음이 많이 아팠겠어요. 이야기해 주셔서 정말 고마워요. 지금 온기님에게 가장 필요한 건 어떤 위로일까요?',
  ],
  angry: [
    '온기님, 정말 답답하고 화가 나셨겠어요. 그런 상황이면 누구라도 그렇게 느꼈을 거예요. 어떤 점이 가장 억울했나요?',
    '화가 나는 건 자연스러운 마음이에요, 온기님. 그만큼 소중한 무언가가 건드려졌다는 뜻일지도 몰라요. 그때 온기님은 어떤 말을 하고 싶었나요?',
    '짜증이 쌓이는 날이 있죠. 여기서는 마음껏 얘기해도 괜찮아요, 온기님. 무엇이 온기님을 가장 힘들게 했나요?',
  ],
  happy: [
    '와, 온기님! 이야기만 들어도 저까지 기분이 좋아져요. 좋은 일은 곱씹을수록 더 오래 남는대요. 그 순간 어떤 기분이 들었나요?',
    '온기님에게 반가운 일이 있었군요! 그런 순간을 알아차리는 것도 멋진 일이에요. 누구와 그 기쁨을 나누고 싶나요?',
    '정말 잘됐어요, 온기님. 오늘의 좋은 기억을 오래 간직하면 좋겠어요. 그 일에서 가장 좋았던 장면은 무엇인가요?',
  ],
  default: [
    '온기님, 이야기해 주셔서 고마워요. 천천히, 편한 만큼만 들려줘도 괜찮아요. 요즘 온기님의 하루는 어떻게 흘러가고 있나요?',
    '그렇군요, 온기님. 딱 잘라 말하기 어려운 마음도 있죠. 지금 떠오르는 대로 조금만 더 이야기해 줄래요?',
    '온기님의 이야기를 잘 듣고 있어요. 정답이 없어도 괜찮아요. 오늘 온기님의 마음을 한 단어로 표현한다면 무엇일까요?',
  ],
};

const CHUNK_SIZE = 3;

export function pickBucket(text: string): MockBucket {
  for (const [bucket, words] of KEYWORDS) {
    if (words.some((w) => text.includes(w))) return bucket;
  }
  return 'default';
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Claude 연동 전까지 쓰는 목업: 키워드별 템플릿 답장을 몇 글자씩 흘려보낸다 */
export function createMockProvider(opts: { delayMs?: number; random?: () => number } = {}): LLMProvider {
  const { delayMs = 25, random = Math.random } = opts;
  return {
    async *streamReply({ messages }) {
      const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
      const options = TEMPLATES[pickBucket(lastUser)];
      const reply = options[Math.floor(random() * options.length) % options.length];
      for (let i = 0; i < reply.length; i += CHUNK_SIZE) {
        if (delayMs > 0) await sleep(delayMs);
        yield reply.slice(i, i + CHUNK_SIZE);
      }
    },
  };
}
