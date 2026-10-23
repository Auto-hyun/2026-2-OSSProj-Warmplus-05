import { createClient } from '@supabase/supabase-js';
import type { Track } from './types';

/**
 * 완성된 Suno 곡을 Supabase 저장소(songs 버킷)로 옮긴다. 서버에서만 쓴다 (비밀 키).
 * Suno 쪽 파일은 2주쯤 뒤 지워지는데, 커뮤니티 배경음악은 그 뒤에도 들려야 하기 때문.
 */
export const SONG_BUCKET = 'songs';

/** 필요한 기능만 (테스트에서 가짜로 바꿔 끼운다) */
export type SongBucket = {
  exists(path: string): Promise<{ data: boolean }>;
  upload(path: string, body: ArrayBuffer, options: { contentType: string; upsert: boolean }): Promise<{ error: unknown }>;
  getPublicUrl(path: string): { data: { publicUrl: string } };
};

/** 저장소 설정이 없으면 null (그러면 Suno 주소를 그대로 쓴다) */
export function songBucket(): SongBucket | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return supabase.storage.from(SONG_BUCKET) as unknown as SongBucket;
}

const SAFE_ID = /^[A-Za-z0-9-]{1,100}$/;

/** 옮기지 못한 곡은 Suno 주소 그대로(temporary) 둔다. 이미 옮긴 곡은 다시 받지 않는다 */
export async function persistTracks(tracks: Track[], bucket: SongBucket | null, fetchImpl: typeof fetch = fetch): Promise<Track[]> {
  if (!bucket) return tracks;
  return Promise.all(
    tracks.map(async (track) => {
      if (!track.temporary || !SAFE_ID.test(track.id)) return track;
      const path = `suno/${track.id}.mp3`;
      try {
        const { data: exists } = await bucket.exists(path);
        if (!exists) {
          const res = await fetchImpl(track.audioUrl, { signal: AbortSignal.timeout(60_000) });
          if (!res.ok) throw new Error(`곡 파일을 받지 못함 (${res.status})`);
          const { error } = await bucket.upload(path, await res.arrayBuffer(), { contentType: 'audio/mpeg', upsert: true });
          if (error) throw error;
        }
        return { ...track, audioUrl: bucket.getPublicUrl(path).data.publicUrl, temporary: false };
      } catch (error) {
        console.error('[songs] 저장소로 옮기지 못했어요', error);
        return track;
      }
    }),
  );
}
