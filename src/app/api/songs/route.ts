import { musicMode } from '@/lib/music/mode';
import { isSongSource, songRequestFor } from '@/lib/music/prompt';
import { createSampleTask, samplePoolFor } from '@/lib/music/sample';
import { createSunoTask, SunoError } from '@/lib/music/suno';
import { createRateLimiter } from '@/lib/rate-limit';

/** 실제 작곡은 크레딧이 들어서, 한 사람(IP)이 10분에 6번까지만 */
const allow = createRateLimiter(6, 10 * 60_000);

/** 작곡 맡기기: { source } → { taskId, mode } */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { source?: unknown } | null;
  const source = isSongSource(body?.source) ? body.source : null;
  const req = source && songRequestFor(source);
  if (!source || !req) return Response.json({ error: '노래 재료가 올바르지 않아요.' }, { status: 400 });

  const mode = musicMode();
  if (mode === 'sample') return Response.json({ taskId: createSampleTask(samplePoolFor(source, req.family)), mode });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (!allow(ip)) return Response.json({ error: '노래를 너무 자주 만들었어요. 10분 뒤에 다시 해 주세요.' }, { status: 429 });

  try {
    const callBackUrl = new URL('/api/suno/callback', request.url).toString();
    const taskId = await createSunoTask(req, process.env.SUNO_API_KEY!, callBackUrl);
    return Response.json({ taskId, mode });
  } catch (error) {
    console.error('[songs] 작곡 요청 실패', error);
    const message = error instanceof SunoError ? error.message : '작곡을 맡기지 못했어요. 잠시 뒤에 다시 해 주세요.';
    return Response.json({ error: message }, { status: 502 });
  }
}
