import { NEGATIVE_TAGS, SONG_SECONDS } from '@/data/music';
import type { SongRequest, TaskStatus } from './types';

/**
 * sunoapi.org(Suno 대행 API) 연결부. 서버에서만 쓴다 (API 키).
 * 문서: https://docs.sunoapi.org/suno-api/generate-music
 */
const BASE_URL = 'https://api.sunoapi.org/api/v1';
const MODEL = 'V6';

/** 응답 code별로 화면에 보여줄 말 */
const ERROR_REASONS: Record<number, string> = {
  401: 'Suno API 키가 올바르지 않아요.',
  405: '요청이 너무 많아요. 잠시 뒤에 다시 해 주세요.',
  413: '곡 설명이 너무 길어요.',
  429: 'Suno 크레딧이 부족해요. 충전한 뒤 다시 해 주세요.',
  430: '요청이 너무 많아요. 잠시 뒤에 다시 해 주세요.',
  455: 'Suno가 점검 중이에요. 잠시 뒤에 다시 해 주세요.',
};

export class SunoError extends Error {
  constructor(
    readonly code: number,
    message: string,
  ) {
    super(message);
  }
}

type Fetch = typeof fetch;

async function call(path: string, apiKey: string, init: RequestInit, fetchImpl: Fetch): Promise<unknown> {
  const res = await fetchImpl(`${BASE_URL}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(20_000),
  });
  const body = (await res.json().catch(() => null)) as { code?: number; msg?: string; data?: unknown } | null;
  const code = body?.code ?? res.status;
  if (code !== 200) throw new SunoError(code, ERROR_REASONS[code] ?? '작곡을 맡기지 못했어요. 잠시 뒤에 다시 해 주세요.');
  return body?.data;
}

/** 작곡을 맡기고 작업 번호(taskId)를 받는다. 가사 없는 연주곡으로 */
export async function createSunoTask(req: SongRequest, apiKey: string, callBackUrl: string, fetchImpl: Fetch = fetch): Promise<string> {
  const data = await call(
    '/generate',
    apiKey,
    {
      method: 'POST',
      body: JSON.stringify({
        customMode: true,
        instrumental: true,
        model: MODEL,
        title: req.title,
        style: req.style,
        negativeTags: NEGATIVE_TAGS,
        duration: SONG_SECONDS,
        callBackUrl,
      }),
    },
    fetchImpl,
  );
  const taskId = (data as { taskId?: unknown } | undefined)?.taskId;
  if (typeof taskId !== 'string') throw new SunoError(500, '작곡을 맡기지 못했어요. 잠시 뒤에 다시 해 주세요.');
  return taskId;
}

const IN_PROGRESS = new Set(['PENDING', 'TEXT_SUCCESS', 'FIRST_SUCCESS']);

type RawTrack = Record<string, unknown>;

/** Suno 곡 정보. 문서는 audio_url처럼 밑줄 이름이지만 audioUrl로 오는 경우도 있어 둘 다 읽는다 */
function readTrack(raw: RawTrack): { id: string; audioUrl: string; duration: number | null } | null {
  const id = raw.id;
  const audioUrl = raw.audio_url ?? raw.audioUrl;
  if (typeof id !== 'string' || typeof audioUrl !== 'string' || !audioUrl.startsWith('https://')) return null;
  return { id, audioUrl, duration: typeof raw.duration === 'number' ? raw.duration : null };
}

/** 작업 조회 결과(data) → 상태. 완성된 곡은 아직 Suno 쪽 주소라 temporary */
export function parseSunoRecord(data: unknown): TaskStatus {
  const record = (data ?? {}) as { status?: unknown; response?: { sunoData?: unknown } | null; errorMessage?: unknown };
  const status = typeof record.status === 'string' ? record.status : 'PENDING';
  const rawTracks = Array.isArray(record.response?.sunoData) ? (record.response.sunoData as RawTrack[]) : [];
  const tracks = rawTracks.map(readTrack).filter((t) => t !== null);

  // 콜백 주소에 알리기만 실패한 것(CALLBACK_EXCEPTION)은 곡이 있으면 성공으로 본다 (개발 중 localhost는 Suno가 부를 수 없다)
  if ((status === 'SUCCESS' || status === 'CALLBACK_EXCEPTION') && tracks.length > 0) {
    return { state: 'done', tracks: tracks.map((t) => ({ ...t, temporary: true })) };
  }
  if (IN_PROGRESS.has(status)) return { state: 'composing' };
  if (status === 'SENSITIVE_WORD_ERROR') return { state: 'failed', reason: '곡 설명에 쓸 수 없는 단어가 있었어요.' };
  return { state: 'failed', reason: '오목이가 곡을 끝내지 못했어요. 다시 만들어 볼까요?' };
}

export async function getSunoTask(taskId: string, apiKey: string, fetchImpl: Fetch = fetch): Promise<TaskStatus> {
  const data = await call(`/generate/record-info?taskId=${encodeURIComponent(taskId)}`, apiKey, { method: 'GET' }, fetchImpl);
  return parseSunoRecord(data);
}
