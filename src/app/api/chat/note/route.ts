import { hasClaudeKey, omokNote } from '@/lib/omok/claude';
import { NOTE_MAX, parseMessages } from '@/lib/omok/context';
import { createRateLimiter } from '@/lib/rate-limit';

/** API 비용 때문에 한 사람(IP)이 10분에 10번까지만 (화면은 대화 20줄마다 한 번 부른다) */
const allow = createRateLimiter(10, 10 * 60_000);

/** 메모를 새로 쓸 때 읽는 최근 대화 줄 수 */
const NOTE_MESSAGES = 40;

/** 오목이 메모 새로 쓰기: { previous, messages } → { summary } */
export async function POST(request: Request) {
  if (!hasClaudeKey()) return Response.json({ error: 'API 키가 없어요.' }, { status: 503 });
  const body = (await request.json().catch(() => null)) as { previous?: unknown; messages?: unknown } | null;
  const messages = parseMessages(body?.messages, NOTE_MESSAGES);
  if (messages.length === 0) return Response.json({ error: '대화가 없어요.' }, { status: 400 });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (!allow(ip)) return Response.json({ error: '메모는 잠시 뒤에 다시 쓸게요.' }, { status: 429 });

  const previous = typeof body?.previous === 'string' ? body.previous.slice(0, NOTE_MAX) : null;
  try {
    const summary = await omokNote(previous, messages);
    return summary ? Response.json({ summary }) : Response.json({ error: '메모를 만들지 못했어요.' }, { status: 502 });
  } catch (error) {
    console.error('[chat/note] 메모 실패', error);
    return Response.json({ error: '메모를 만들지 못했어요.' }, { status: 502 });
  }
}
