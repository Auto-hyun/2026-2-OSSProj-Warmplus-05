import Anthropic from '@anthropic-ai/sdk';
import type { ChatContext } from './context';

/** 서버에서만 쓴다 (API 키). 모델은 .env.local의 OMOK_MODEL로 바꿀 수 있다 */
export const OMOK_MODEL = process.env.OMOK_MODEL || 'claude-sonnet-5-5';

export function hasClaudeKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const PERSONA = `너는 "오목이"야. 흰머리 오목눈이 새 캐릭터이고, 사용자의 마음을 지켜 주는 다정한 친구야.
- 반말로, 따뜻하고 짧게 (2~4문장). 이모지는 가끔 하나 정도.
- 먼저 마음을 알아주고, 필요할 때만 작은 제안을 해. 훈계나 정답 제시는 하지 마.
- 아래 "기억"에 있는 기분 기록, 테스트 결과, 이전 메모를 자연스럽게 떠올려서 말해. 없는 사실을 지어내지 마.
- 너는 상담사나 의사가 아니야. 진단, 병명, 약 이야기는 하지 말고, 전문 도움이 필요해 보이면 부드럽게 권해.
- 사용자가 자신을 해치거나 죽고 싶다는 뜻을 비치면, 마음을 받아 준 뒤 자살예방 상담전화 109(24시간), 위급하면 112·119를 꼭 안내해.`;

function memoryBlock(context: ChatContext): string {
  const lines = [
    `오목이 메모: ${context.note ?? '아직 없음'}`,
    `최근 기분 기록: ${context.moods.length ? context.moods.join(' / ') : '없음'}`,
    `최근 심리테스트: ${context.tests.length ? context.tests.join(' / ') : '없음'}`,
  ];
  return `기억 (이 기기에 저장된 사용자 기록):\n${lines.join('\n')}`;
}

function textOf(response: Anthropic.Beta.BetaMessage): string {
  return response.content
    .flatMap((b) => (b.type === 'text' ? [b.text] : []))
    .join('')
    .trim();
}

/** 오목이 대답 한 번. 거절(refusal)이면 null */
export async function omokReply(context: ChatContext, text: string): Promise<string | null> {
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
      { type: 'text', text: memoryBlock(context) },
    ],
    messages: [...history, { role: 'user', content: text }],
  });
  if (response.stop_reason === 'refusal') return null;
  return textOf(response) || null;
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
