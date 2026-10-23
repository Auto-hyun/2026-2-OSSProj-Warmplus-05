import type { MusicMode, SongSource, TaskStatus } from './types';

async function readError(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: unknown } | null;
  return typeof body?.error === 'string' ? body.error : fallback;
}

/** 작곡 맡기기 (브라우저 → /api/songs) */
export async function startSong(source: SongSource): Promise<{ taskId: string; mode: MusicMode }> {
  const res = await fetch('/api/songs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source }),
  });
  if (!res.ok) throw new Error(await readError(res, '작곡을 맡기지 못했어요. 잠시 뒤에 다시 해 주세요.'));
  return res.json();
}

/** 작곡 상태 확인. 네트워크 오류는 그대로 던진다 (다음 확인 때 다시 시도) */
export async function checkSong(taskId: string): Promise<TaskStatus> {
  const res = await fetch(`/api/songs/${encodeURIComponent(taskId)}`, { cache: 'no-store' });
  if (res.status === 404) return { state: 'failed', reason: '작곡 작업을 찾지 못했어요.' };
  if (!res.ok) throw new Error(await readError(res, '작곡 상태를 확인하지 못했어요.'));
  return res.json();
}
