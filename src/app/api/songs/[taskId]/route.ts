import { musicMode } from '@/lib/music/mode';
import { persistTracks, songBucket } from '@/lib/music/persist';
import { getSampleTask, isSampleTaskId } from '@/lib/music/sample';
import { getSunoTask, SunoError } from '@/lib/music/suno';

const TASK_ID = /^[A-Za-z0-9_-]{1,100}$/;

/** 작곡 상태 확인: composing → done(곡 목록) 또는 failed. 완성된 Suno 곡은 저장소로 옮겨서 돌려준다 */
export async function GET(_request: Request, ctx: RouteContext<'/api/songs/[taskId]'>) {
  const { taskId } = await ctx.params;
  if (isSampleTaskId(taskId)) return Response.json(getSampleTask(taskId));
  if (musicMode() !== 'suno' || !TASK_ID.test(taskId)) return Response.json({ error: '없는 작업이에요.' }, { status: 404 });

  try {
    const status = await getSunoTask(taskId, process.env.SUNO_API_KEY!);
    if (status.state !== 'done') return Response.json(status);
    return Response.json({ ...status, tracks: await persistTracks(status.tracks, songBucket()) });
  } catch (error) {
    console.error('[songs] 작곡 상태 확인 실패', error);
    const message = error instanceof SunoError ? error.message : '작곡 상태를 확인하지 못했어요.';
    return Response.json({ error: message }, { status: 502 });
  }
}
