// @vitest-environment node
/**
 * 실제 Supabase 저장소(로컬 `supabase start`)에 곡을 올려 보는 시험. 평소 `npm test`에서는 건너뛴다.
 * SUPABASE_TEST_URL=http://127.0.0.1:54321 SUPABASE_TEST_SECRET=<secret key> npx vitest run lib/music/persist.integration
 */
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { persistTracks, songBucket } from './persist';

const url = process.env.SUPABASE_TEST_URL;
const secret = process.env.SUPABASE_TEST_SECRET;

describe.skipIf(!url || !secret)('persistTracks (Supabase 저장소)', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('Suno 곡 파일을 받아 songs 버킷에 올리고, 공개 주소로 누구나 들을 수 있다', async () => {
    const mp3 = readFileSync('public/samples/calm-1.mp3');
    // Suno 파일 서버 대신
    const server = createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
      res.end(mp3);
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;

    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', url!);
    vi.stubEnv('SUPABASE_SECRET_KEY', secret!);
    const id = `test-${Date.now()}`;
    try {
      const [track] = await persistTracks(
        [{ id, audioUrl: `http://127.0.0.1:${port}/song.mp3`, duration: 30, temporary: true }],
        songBucket(),
      );
      expect(track.temporary).toBe(false);
      expect(track.audioUrl).toBe(`${url}/storage/v1/object/public/songs/suno/${id}.mp3`);

      const res = await fetch(track.audioUrl);
      expect(res.status).toBe(200);
      expect((await res.arrayBuffer()).byteLength).toBe(mp3.length);
    } finally {
      server.close();
    }
  });
});
