import Anthropic from '@anthropic-ai/sdk';
import { hasClaudeKey, omokReply } from '@/lib/omok/claude';
import type { ChatContext } from '@/lib/omok/context';
import { CRISIS_REPLY, isCrisis } from '@/lib/omok/safety';
import { createRateLimiter } from '@/lib/rate-limit';

/** API 비용 때문에 한 사람(IP)이 10분에 30번까지만 */
const allow = createRateLimiter(30, 10 * 60_000);

const EMPTY: ChatContext = { note: null, moods: [], tests: [], messages: [] };

/** 오목이 대답: { text, context } → { reply, crisis, mode }. API 키가 없으면 정해진 말(offline) */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { text?: unknown; context?: ChatContext } | null;
  const text = typeof body?.text === 'string' ? body.text.trim().slice(0, 500) : '';
  if (!text) return Response.json({ error: '할 말을 적어 줘.' }, { status: 400 });
  const context = body?.context ?? EMPTY;

  // 위기 표현은 모델보다 먼저, 항상 같은 안내로
  if (isCrisis(text)) return Response.json({ reply: CRISIS_REPLY, crisis: true, mode: 'safety' });

  if (!hasClaudeKey()) {
    const today = context.moods?.[0];
    const reply = today
      ? `그랬구나. 최근 마음 날씨가 "${today.replace(/^\S+ /, '').replace(/ 메모:.*$/, '')}"이었지. 조금 더 이야기해 줄래?`
      : '그랬구나. 이야기해 줘서 고마워. 오늘 마음 날씨는 어땠어?';
    return Response.json({ reply, crisis: false, mode: 'offline' });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (!allow(ip)) return Response.json({ error: '오늘 이야기를 많이 했네. 10분만 쉬었다가 다시 이야기하자.' }, { status: 429 });

  try {
    const reply = await omokReply(context, text);
    return Response.json({ reply: reply ?? '음, 그 이야기는 내가 잘 대답하기 어려워. 다른 이야기도 들려줄래?', crisis: false, mode: 'claude' });
  } catch (error) {
    console.error('[chat] 오목이 대답 실패', error);
    const reply =
      error instanceof Anthropic.AuthenticationError
        ? 'API 키가 맞지 않아. .env.local을 확인해 줘.'
        : error instanceof Anthropic.RateLimitError
          ? '지금 말이 너무 많이 몰렸어. 잠시 뒤에 다시 말해 줘.'
          : '잠깐 말을 놓쳤어. 다시 말해 줄래?';
    return Response.json({ error: reply }, { status: 502 });
  }
}
