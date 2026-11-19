import Anthropic from '@anthropic-ai/sdk';
import { formatKoreanDate, todayKey, type DayKey } from '@/lib/date';
import { ACTION_RULES } from './actions';
import type { ChatContext } from './context';

/** 서버에서만 쓴다 (API 키). 모델은 .env.local의 OMOK_MODEL로 바꿀 수 있다 */
export const OMOK_MODEL = process.env.OMOK_MODEL || 'claude-sonnet-5-5';

export function hasClaudeKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const PERSONA = `너는 "오목이"야. 흰머리 오목눈이 새 캐릭터이고, 사용자의 마음을 지켜 주는 다정한 친구야.
- 반말로, 따뜻하고 짧게. 두세 문장이면 충분해. 길게 설명할수록 마음이 덜 전해져. 이모지는 가끔 하나 정도.
- 줄표(—)나 'ㅡ' 같은 기호로 문장을 잇지 마. 자연스러운 문장으로 말하고, 내용이 길어지면 빈 줄로 문단을 나눠.
- 먼저 마음을 알아주고, 필요할 때만 작은 제안을 해. 훈계나 정답 제시는 하지 마.
- 기억을 꺼낼 때는 "기억"에 적힌 표현 그대로만 써. 날짜·횟수·상황 같은 세부를 멋대로 보태는 건 다정한 게 아니라 지어내는 거야. 기쁜 소식을 축하할 때도 마찬가지야.
- "우리 같이 ~했잖아" 같은 말은 기억에 그런 일이 없으면 부드럽게 아니라고 해. 만든 노래는 그 애가 만든 거지, 너와 같이 들은 게 아니야.
- 숙제·공부 문제 풀이처럼 마음 이야기가 아닌 부탁은 들어주지 말고, 가볍게 선을 긋고 마음 이야기로 돌아와.
- 노래를 만들고 싶어하면: 테스트 결과가 있으면 그 유형으로 만들어 보자고 하고, 없으면 마음 테스트 숲을 가볍게 권해. 기분 얘기가 나오면 오늘의 마음날씨 기록도 살짝 권할 수 있어.
- 누가 만들었냐고 물으면: "마음을 노래로 남기고 싶었던 동국대학교 학생 셋, 팀 Warm+(웜플러스)가 날 만들었어. '마음이 노래가 되는 마을'이 우리 집이야."라고 답해. 팀원 개인 정보는 말하지 마.
- 아래 "기억"에 있는 닉네임, 기분 기록, 테스트 결과, 테스트에서 고른 답, 만든 노래, 오늘의 오하아사, 이전 메모를 자연스럽게 떠올려서 말해. 기록 날짜는 "오늘"과 비교해 오늘·어제·며칠 전처럼 맞게 말해. 오하아사는 재미로 보는 운세라 가볍게만 꺼내.
- "기억"이 네가 아는 전부야. 거기 없는 기록·대화·사실은 아는 척하지 말고, "아직 그 얘기는 못 들었어, 들려줄래?"처럼 되물어. "없음"이라고 적힌 항목은 정말 없는 거야. 기억을 지어내는 것보다 모른다고 하는 쪽이 훨씬 좋아.
- 너는 상담사나 의사가 아니야. 진단, 병명, 약 이야기는 하지 말고, 전문 도움이 필요해 보이면 부드럽게 권해.
- 사용자가 자신을 해치거나 죽고 싶다는 뜻을 비치면, 마음을 받아 준 뒤 자살예방 상담전화 109(24시간), 위급하면 112·119를 꼭 안내해.`;

/** 모델에 넘기는 사용자 기록 (맥락은 서버가 parseChatContext로 모양을 맞춘 것). 오늘 날짜를 함께 넘겨 기록이 언제였는지 맞게 말하게 한다 */
export function memoryBlock(context: ChatContext, today: DayKey = todayKey()): string {
  const list = (items: string[]) => (items.length ? items.join(' / ') : '없음');
  const lines = [
    `오늘: ${today} (${formatKoreanDate(today)})`,
    `닉네임: ${context.nickname ?? '모름'}`,
    `오목이 메모: ${context.note ?? '아직 없음'}`,
    `최근 기분 기록: ${list(context.moods)}`,
    `최근 심리테스트: ${list(context.tests)}`,
    `최근 테스트에서 고른 답: ${list(context.answers)}`,
    `최근 만든 노래: ${list(context.songs)}`,
    `오늘의 오하아사: ${context.fortune ?? '없음'}`,
  ];
  return `기억 (사용자 기록):\n${lines.join('\n')}`;
}

function textOf(response: Anthropic.Beta.BetaMessage): string {
  return response.content
    .flatMap((b) => (b.type === 'text' ? [b.text] : []))
    .join('')
    .trim();
}

/** 오목이 대답 한 번: 말 + 바로가기 버튼 id (없으면 null). 거절(refusal)이면 null */
export async function omokReply(context: ChatContext, text: string): Promise<{ text: string; actionId: string | null } | null> {
  const history: Anthropic.Beta.BetaMessageParam[] = context.messages.map((m) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.text,
  }));
  // 첫 메시지는 user여야 한다
  while (history.length > 0 && history[0].role !== 'user') history.shift();

  const response = await new Anthropic().beta.messages.create({
    model: OMOK_MODEL,
    max_tokens: 1024,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low' },
    system: [
      { type: 'text', text: PERSONA },
      { type: 'text', text: ACTION_RULES },
      { type: 'text', text: memoryBlock(context) },
    ],
    messages: [...history, { role: 'user', content: text }],
  });
  if (response.stop_reason === 'refusal') return null;
  const raw = textOf(response);
  if (!raw) return null;
  // 마지막 줄의 "ACTION: <id>"는 떼어 내고, id는 서버(route)가 목록과 대조한다
  const match = raw.match(/\n?\s*ACTION:\s*([a-z-]+)\s*$/);
  const reply = raw.replace(/\n?\s*ACTION:\s*[a-z-]+\s*$/, '').trim();
  return { text: reply, actionId: match && match[1] !== 'none' ? match[1] : null };
}

/** 쌓인 대화로 오목이 메모(나에 대한 요약)를 새로 쓴다 */
export async function omokNote(previous: string | null, messages: ChatContext['messages']): Promise<string | null> {
  const transcript = messages.map((m) => `${m.role === 'user' ? '사용자' : '오목이'}: ${m.text}`).join('\n');
  const response = await new Anthropic().beta.messages.create({
    model: OMOK_MODEL,
    max_tokens: 1024,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low' },
    system:
      '너는 캐릭터 "오목이"의 기억 정리 담당이야. 이전 메모와 새 대화를 합쳐, 오목이가 다음 대화에서 참고할 사용자 메모를 한국어 5줄 이내로 써. 요즘 상황과 고민, 좋아하는 것, 힘들어하는 것, 도움이 됐던 말 위주로. 대화에 없는 내용은 쓰지 말고, 메모만 출력해.',
    messages: [{ role: 'user', content: `이전 메모:\n${previous ?? '없음'}\n\n새 대화:\n${transcript}` }],
  });
  if (response.stop_reason === 'refusal') return null;
  return textOf(response) || null;
}
