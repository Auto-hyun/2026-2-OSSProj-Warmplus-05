import type { ChatMessage } from './llm/types';
import type { StoredMessage } from './storage/types';

/** 무슨 말부터 할지 막막할 때 누르는 빠른 답 */
export const QUICK_REPLIES: readonly string[] = ['잘 모르겠어요', '그냥 좀 지쳤어요', '좋은 일이 있었어요'];

/** 오늘 사용자 메시지가 이만큼 쌓이면 온기우편함 연결 카드를 한 번 보여준다 */
export const BRIDGE_AFTER_USER_MESSAGES = 3;

const RECENT_LIMIT = 20;

/** 서버로 보낼 메시지: 질문(뱁새) + 최근 대화 limit개 */
export function buildRequestMessages(question: string, messages: StoredMessage[], limit = RECENT_LIMIT): ChatMessage[] {
  return [
    { role: 'assistant', content: question },
    ...messages.slice(-limit).map(({ role, content }) => ({ role, content })),
  ];
}

export type ReplyResult = { type: 'text'; text: string } | { type: 'safety'; message: string };

/** 뱁새 답장 요청. 스트리밍 조각을 onChunk로 알려주고, 비정상 응답이면 예외 */
export async function requestReply(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  fetchImpl: typeof fetch = fetch,
): Promise<ReplyResult> {
  const res = await fetchImpl('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    let message = '답장을 받지 못했어요.';
    try {
      message = (await res.json()).error ?? message;
    } catch {
      // 본문이 JSON이 아니면 기본 문구
    }
    throw new Error(message);
  }

  if ((res.headers.get('content-type') ?? '').includes('application/json')) {
    const data = await res.json();
    if (data?.type === 'safety' && typeof data.message === 'string') return { type: 'safety', message: data.message };
    throw new Error('알 수 없는 응답이에요.');
  }

  if (!res.body) {
    const text = await res.text();
    onChunk(text);
    return { type: 'text', text };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) {
      text += chunk;
      onChunk(chunk);
    }
  }
  const rest = decoder.decode();
  if (rest) {
    text += rest;
    onChunk(rest);
  }
  return { type: 'text', text };
}
