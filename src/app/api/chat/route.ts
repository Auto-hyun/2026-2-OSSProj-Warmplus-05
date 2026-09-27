import { getProvider } from '@/lib/llm/provider';
import { PERSONA_PROMPT } from '@/lib/llm/persona';
import { validateChatRequest } from '@/lib/llm/validate';
import type { LLMProvider } from '@/lib/llm/types';
import { SAFETY_MESSAGE, detectCrisis } from '@/lib/safety';

/** 정상 요청(질문 + 최근 대화 20개)은 커도 100KB 안팎이라 넉넉히 잡은 상한(바이트) */
const MAX_BODY_SIZE = 256 * 1024;
const TOO_LARGE = '요청이 너무 커요.';

/** 본문을 조금씩 읽으며 크기를 센다. 상한을 넘으면 그만 읽고 null */
async function readBody(req: Request): Promise<string | null> {
  if (!req.body) return '';
  const reader = req.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_SIZE) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

function errorResponse(error: string, status: number): Response {
  return Response.json({ error }, { status });
}

/**
 * 오목이 답장 API.
 * - 정상: text/plain 스트림
 * - 위기 표현: 모델을 부르지 않고 { type: 'safety', message } JSON
 * - 요청 오류 400, 너무 큰 요청 413, 모델 오류 502
 */
export async function POST(req: Request): Promise<Response> {
  if (Number(req.headers.get('content-length')) > MAX_BODY_SIZE) return errorResponse(TOO_LARGE, 413);

  let body: unknown;
  try {
    // Content-Length 없이 흘려보내는 요청도 상한까지만 읽는다
    const raw = await readBody(req);
    if (raw === null) return errorResponse(TOO_LARGE, 413);
    body = JSON.parse(raw);
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
