import { getProvider } from '@/lib/llm/provider';
import { PERSONA_PROMPT } from '@/lib/llm/persona';
import { validateChatRequest } from '@/lib/llm/validate';
import type { LLMProvider } from '@/lib/llm/types';
import { SAFETY_MESSAGE, detectCrisis } from '@/lib/safety';

function errorResponse(error: string, status: number): Response {
  return Response.json({ error }, { status });
}

/**
 * 뱁새 답장 API.
 * - 정상: text/plain 스트림
 * - 위기 표현: 모델을 부르지 않고 { type: 'safety', message } JSON
 * - 요청 오류 400, 모델 오류 502
 */
export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse('요청 형식이 올바르지 않아요.', 400);
  }

  const validated = validateChatRequest(body);
  if (!validated.ok) return errorResponse(validated.error, 400);

  const lastUser = validated.messages[validated.messages.length - 1];
  if (detectCrisis(lastUser.content)) {
    return Response.json({ type: 'safety', message: SAFETY_MESSAGE });
  }

  let provider: LLMProvider;
  try {
    provider = getProvider();
  } catch {
    return errorResponse('대화 기능을 준비하고 있어요. 잠시 후 다시 시도해 주세요.', 502);
  }

  const iterator = provider.streamReply({ system: PERSONA_PROMPT, messages: validated.messages })[Symbol.asyncIterator]();

  // 첫 조각을 먼저 받아서, 스트림 시작 전에 난 오류는 502로 돌려준다
  let first: IteratorResult<string>;
  try {
    first = await iterator.next();
  } catch {
    return errorResponse('답장을 만들지 못했어요. 다시 보내 주세요.', 502);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      if (first.done) controller.close();
      else controller.enqueue(encoder.encode(first.value));
    },
    async pull(controller) {
      try {
        const { value, done } = await iterator.next();
        if (done) controller.close();
        else controller.enqueue(encoder.encode(value));
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel() {
      await iterator.return?.();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
