import type { ChatMessage } from './types';

export const MAX_USER_CHARS = 1000;
export const MAX_MESSAGES = 40;
export const MAX_ASSISTANT_CHARS = 2000;

type Result = { ok: true; messages: ChatMessage[] } | { ok: false; error: string };

function fail(error: string): Result {
  return { ok: false, error };
}

/** /api/chat 요청 본문 검사. 통과하면 role·content만 남긴 메시지를 준다 */
export function validateChatRequest(body: unknown): Result {
  if (typeof body !== 'object' || body === null || !Array.isArray((body as { messages?: unknown }).messages)) {
    return fail('요청 형식이 올바르지 않아요.');
  }
  const raw = (body as { messages: unknown[] }).messages;
  if (raw.length === 0) return fail('보낼 메시지가 없어요.');
  if (raw.length > MAX_MESSAGES) return fail('메시지가 너무 많아요.');

  const messages: ChatMessage[] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) return fail('요청 형식이 올바르지 않아요.');
    const { role, content } = item as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') {
      return fail('요청 형식이 올바르지 않아요.');
    }
    if (role === 'user') {
      if (content.trim().length === 0) return fail('빈 메시지는 보낼 수 없어요.');
      if (content.length > MAX_USER_CHARS) return fail(`메시지는 ${MAX_USER_CHARS.toLocaleString()}자까지 보낼 수 있어요.`);
    } else if (content.length > MAX_ASSISTANT_CHARS) {
      return fail('요청 형식이 올바르지 않아요.');
    }
    messages.push({ role, content });
  }

  if (messages[messages.length - 1].role !== 'user') return fail('마지막 메시지는 사용자 메시지여야 해요.');
  return { ok: true, messages };
}
