import { hasClaudeKey, omokNote } from '@/lib/omok/claude';
import type { ChatContext } from '@/lib/omok/context';

/** 오목이 메모 새로 쓰기: { previous, messages } → { summary } */
export async function POST(request: Request) {
  if (!hasClaudeKey()) return Response.json({ error: 'API 키가 없어요.' }, { status: 503 });
  const body = (await request.json().catch(() => null)) as { previous?: unknown; messages?: ChatContext['messages'] } | null;
  const messages = Array.isArray(body?.messages) ? body.messages.slice(-40) : [];
  if (messages.length === 0) return Response.json({ error: '대화가 없어요.' }, { status: 400 });
  try {
    const summary = await omokNote(typeof body?.previous === 'string' ? body.previous : null, messages);
    return summary ? Response.json({ summary }) : Response.json({ error: '메모를 만들지 못했어요.' }, { status: 502 });
  } catch (error) {
    console.error('[chat/note] 메모 실패', error);
    return Response.json({ error: '메모를 만들지 못했어요.' }, { status: 502 });
  }
}
