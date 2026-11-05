import { SAMPLE_DELAY_MS } from '@/lib/music/sample';
import { GET } from './[taskId]/route';
import { POST } from './route';

function post(body: unknown) {
  return POST(new Request('http://localhost/api/songs', { method: 'POST', body: JSON.stringify(body) }));
}

function get(taskId: string) {
  return GET(new Request(`http://localhost/api/songs/${taskId}`), { params: Promise.resolve({ taskId }) });
}

describe('샘플 곡 모드 (Suno 설정이 없을 때)', () => {
  beforeEach(() => {
    vi.stubEnv('MUSIC_PROVIDER', '');
    vi.stubEnv('SUNO_API_KEY', '');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('감정 단어로 작곡을 맡기면 작업 번호를 준다', async () => {
    const res = await post({ source: { kind: 'words', words: ['sadness'] } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mode).toBe('sample');
    expect(body.taskId).toMatch(/^sample-sad-\d{13}$/);
  });

  it('잘못된 재료는 400', async () => {
    for (const body of [null, { source: { kind: 'words', words: ['nope'] } }, { source: { kind: 'free', prompt: 'x' } }]) {
      expect((await post(body)).status).toBe(400);
    }
  });

  it('몇 초 동안은 작곡 중, 그 뒤엔 같은 갈래의 샘플 곡 2개', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-18T10:00:00Z'));
    const { taskId } = await (await post({ source: { kind: 'test', testId: 'example', resultId: 'd' } })).json();

    expect(await (await get(taskId)).json()).toEqual({ state: 'composing' });

    vi.setSystemTime(Date.now() + SAMPLE_DELAY_MS);
    const done = await (await get(taskId)).json();
    expect(done.state).toBe('done');
    expect(done.tracks.map((t: { audioUrl: string }) => t.audioUrl)).toEqual(['/samples/happy-1.mp3', '/samples/happy-2.mp3']);
  });

  it('불안·스트레스·답답함을 고르면 (순서 상관없이) 전용 샘플 곡 2개', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-18T10:00:00Z'));
    const { taskId } = await (await post({ source: { kind: 'words', words: ['stuffy', 'anxiety', 'stress'] } })).json();
    expect(taskId).toMatch(/^sample-unease-\d{13}$/);

    vi.setSystemTime(Date.now() + SAMPLE_DELAY_MS);
    const done = await (await get(taskId)).json();
    expect(done.tracks.map((t: { audioUrl: string }) => t.audioUrl)).toEqual(['/samples/unease-1.mp3', '/samples/unease-2.mp3']);
  });

  it('같은 스트레스 갈래라도 다른 조합이면 갈래 샘플 곡', async () => {
    const { taskId } = await (await post({ source: { kind: 'words', words: ['anxiety', 'stress'] } })).json();
    expect(taskId).toMatch(/^sample-stress-\d{13}$/);
  });

  it('Suno를 쓰지 않을 때 모르는 작업 번호는 404', async () => {
    expect((await get('abc')).status).toBe(404);
  });
});
