import { persistTracks, type SongBucket } from './persist';
import type { Track } from './types';

const suno: Track = { id: 'abc-123', audioUrl: 'https://cdn.suno.example/abc.mp3', duration: 120, temporary: true };

function fakeBucket(existing: string[] = [], uploadError: unknown = null) {
  const uploaded: string[] = [];
  const bucket: SongBucket = {
    exists: vi.fn(async (path: string) => ({ data: existing.includes(path) })),
    upload: vi.fn(async (path: string) => {
      uploaded.push(path);
      return { error: uploadError };
    }),
    getPublicUrl: (path: string) => ({ data: { publicUrl: `https://store.example/songs/${path}` } }),
  };
  return { bucket, uploaded };
}

const okFetch = vi.fn(async () => new Response(new Uint8Array([1, 2, 3]), { status: 200 }));

describe('persistTracks', () => {
  beforeEach(() => okFetch.mockClear());

  it('저장소가 없으면 그대로', async () => {
    await expect(persistTracks([suno], null, okFetch)).resolves.toEqual([suno]);
  });

  it('Suno 곡을 받아 저장소에 올리고 저장소 주소로 바꾼다', async () => {
    const { bucket, uploaded } = fakeBucket();
    const [track] = await persistTracks([suno], bucket, okFetch);
    expect(uploaded).toEqual(['suno/abc-123.mp3']);
    expect(track).toEqual({ ...suno, audioUrl: 'https://store.example/songs/suno/abc-123.mp3', temporary: false });
  });

  it('이미 올린 곡은 다시 받지 않는다', async () => {
    const { bucket, uploaded } = fakeBucket(['suno/abc-123.mp3']);
    const [track] = await persistTracks([suno], bucket, okFetch);
    expect(okFetch).not.toHaveBeenCalled();
    expect(uploaded).toEqual([]);
    expect(track.temporary).toBe(false);
  });

  it('올리다 실패하면 Suno 주소 그대로 (temporary)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { bucket } = fakeBucket([], new Error('quota'));
    await expect(persistTracks([suno], bucket, okFetch)).resolves.toEqual([suno]);
  });

  it('이상한 id나 이미 옮긴 곡은 건드리지 않는다', async () => {
    const { bucket, uploaded } = fakeBucket();
    const weird = { ...suno, id: '../../etc' };
    const sample = { ...suno, audioUrl: '/samples/sad-1.mp3', temporary: false };
    await expect(persistTracks([weird, sample], bucket, okFetch)).resolves.toEqual([weird, sample]);
    expect(uploaded).toEqual([]);
  });
});
