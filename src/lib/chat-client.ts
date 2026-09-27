import type { ChatMessage } from './llm/types';
import { MAX_ASSISTANT_CHARS, MAX_USER_CHARS } from './llm/validate';
import type { StoredMessage } from './storage/types';

/** 무슨 말부터 할지 막막할 때 누르는 빠른 답 */
export const QUICK_REPLIES: readonly string[] = ['잘 모르겠어요', '그냥 좀 지쳤어요', '좋은 일이 있었어요'];

/** 오늘 사용자 메시지가 이만큼 쌓이면 온기우편함 연결 카드를 한 번 보여준다 */
export const BRIDGE_AFTER_USER_MESSAGES = 3;

const RECENT_LIMIT = 20;

/** 서버로 보낼 메시지: 질문(오목이) + 최근 대화 limit개. 서버 허용 길이를 넘는 메시지는 자른다 */
export function buildRequestMessages(question: string, messages: StoredMessage[], limit = RECENT_LIMIT): ChatMessage[] {
  return [
    { role: 'assistant', content: question },
    ...messages.slice(-limit).map(({ role, content }) => ({
      role,
      content: content.slice(0, role === 'user' ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS),
    })),
  ];
}

export type ReplyResult = { type: 'text'; text: string } | { type: 'safety'; message: string };

/** 답장을 받지 못한 이유. retryable이면 같은 요청을 다시 보내 볼 만하다 */
export class ReplyError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = 'ReplyError';
  }
}

/** 이 시간 동안 새 응답(조각)이 없으면 멈춘다 */
const REPLY_TIMEOUT_MS = 30_000;

/** 오목이 답장 요청. 스트리밍 조각을 onChunk로 알려주고, 받지 못하면 ReplyError */
export async function requestReply(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  fetchImpl: typeof fetch = fetch,
): Promise<ReplyResult> {
  const controller = new AbortController();
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const restartTimer = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
      reader?.cancel().catch(() => {});
    }, REPLY_TIMEOUT_MS);
  };

  try {
    restartTimer();
    const res = await fetchImpl('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });

    if (!res.ok) {
      let message = '답장을 받지 못했어요.';
      try {
        message = (await res.json()).error ?? message;
      } catch {
        // 본문이 JSON이 아니면 기본 문구
      }
      throw new ReplyError(message, res.status >= 500);
    }

    if ((res.headers.get('content-type') ?? '').includes('application/json')) {
      const data = await res.json();
      if (data?.type === 'safety' && typeof data.message === 'string') return { type: 'safety', message: data.message };
      throw new ReplyError('알 수 없는 응답이에요.', true);
    }

    if (!res.body) {
      const text = await res.text();
      onChunk(text);
      return { type: 'text', text };
    }

    reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      restartTimer();
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        text += chunk;
        onChunk(chunk);
      }
    }
    // 시간 초과로 읽기를 멈춰도 done이 오므로 여기서 가려낸다 (아래 catch가 시간 초과로 알린다)
    if (timedOut) throw new Error('timeout');
    const rest = decoder.decode();
    if (rest) {
      text += rest;
      onChunk(rest);
    }
    return { type: 'text', text };
  } catch (error) {
    if (timedOut) throw new ReplyError('답장이 늦어지고 있어요. 다시 보내 주세요.', true);
    if (error instanceof ReplyError) throw error;
    // 인터넷 끊김, 스트림 중단 등
    throw new ReplyError('답장을 받지 못했어요. 다시 보내 주세요.', true);
  } finally {
    clearTimeout(timer);
  }
}
