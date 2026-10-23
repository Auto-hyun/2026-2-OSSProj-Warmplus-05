import { createSunoTask, getSunoTask, parseSunoRecord, SunoError } from './suno';

const req = { title: '슬픔의 노래', style: 'instrumental, sad', family: 'sad' as const };

function fakeFetch(body: unknown, status = 200) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));
}

describe('createSunoTask', () => {
  it('가사 없는 연주곡(customMode·instrumental)으로 맡기고 taskId를 돌려준다', async () => {
    const fetchImpl = fakeFetch({ code: 200, msg: 'success', data: { taskId: 'task-1' } });
    await expect(createSunoTask(req, 'key', 'https://app.example/api/suno/callback', fetchImpl)).resolves.toBe('task-1');

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.sunoapi.org/api/v1/generate');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer key');
    const sent = JSON.parse(init.body as string);
    expect(sent).toMatchObject({
      customMode: true,
      instrumental: true,
      model: 'V6',
      title: '슬픔의 노래',
      style: 'instrumental, sad',
      callBackUrl: 'https://app.example/api/suno/callback',
    });
    expect(sent.negativeTags).toContain('vocals');
  });

  it('크레딧이 부족하면(429) 알아들을 수 있는 말로 실패한다', async () => {
    const fetchImpl = fakeFetch({ code: 429, msg: 'Insufficient credits' });
    const error = await createSunoTask(req, 'key', 'https://x/cb', fetchImpl).catch((e) => e);
    expect(error).toBeInstanceOf(SunoError);
    expect(error.code).toBe(429);
    expect(error.message).toContain('크레딧');
  });

  it('HTTP 오류로 본문이 없어도 실패로 처리한다', async () => {
    const fetchImpl = vi.fn(async () => new Response('bad gateway', { status: 502 }));
    await expect(createSunoTask(req, 'key', 'https://x/cb', fetchImpl)).rejects.toBeInstanceOf(SunoError);
  });
});

describe('parseSunoRecord', () => {
  const track = { id: 't1', audio_url: 'https://cdn.example/t1.mp3', duration: 118.5 };

  it('진행 중 상태는 composing', () => {
    for (const status of ['PENDING', 'TEXT_SUCCESS', 'FIRST_SUCCESS']) {
      expect(parseSunoRecord({ status, response: { sunoData: [track] } })).toEqual({ state: 'composing' });
    }
  });

  it('SUCCESS면 곡 목록 (아직 Suno 쪽 주소라 temporary)', () => {
    expect(parseSunoRecord({ status: 'SUCCESS', response: { sunoData: [track, { ...track, id: 't2' }] } })).toEqual({
      state: 'done',
      tracks: [
        { id: 't1', audioUrl: 'https://cdn.example/t1.mp3', duration: 118.5, temporary: true },
        { id: 't2', audioUrl: 'https://cdn.example/t1.mp3', duration: 118.5, temporary: true },
      ],
    });
  });

  it('audioUrl(카멜 표기)로 와도 읽는다', () => {
    const status = parseSunoRecord({ status: 'SUCCESS', response: { sunoData: [{ id: 't1', audioUrl: 'https://cdn.example/a.mp3' }] } });
    expect(status).toEqual({ state: 'done', tracks: [{ id: 't1', audioUrl: 'https://cdn.example/a.mp3', duration: null, temporary: true }] });
  });

  it('콜백 알림만 실패(CALLBACK_EXCEPTION)했고 곡이 있으면 성공', () => {
    expect(parseSunoRecord({ status: 'CALLBACK_EXCEPTION', response: { sunoData: [track] } }).state).toBe('done');
    expect(parseSunoRecord({ status: 'CALLBACK_EXCEPTION', response: null }).state).toBe('failed');
  });

  it('실패 상태와 https가 아닌 주소는 실패', () => {
    expect(parseSunoRecord({ status: 'GENERATE_AUDIO_FAILED' }).state).toBe('failed');
    expect(parseSunoRecord({ status: 'SENSITIVE_WORD_ERROR' })).toEqual({ state: 'failed', reason: '곡 설명에 쓸 수 없는 단어가 있었어요.' });
    expect(parseSunoRecord({ status: 'SUCCESS', response: { sunoData: [{ id: 'x', audio_url: 'javascript:alert(1)' }] } }).state).toBe('failed');
  });
});

describe('getSunoTask', () => {
  it('taskId로 조회한다', async () => {
    const fetchImpl = fakeFetch({ code: 200, data: { status: 'PENDING' } });
    await expect(getSunoTask('a/b', 'key', fetchImpl)).resolves.toEqual({ state: 'composing' });
    expect((fetchImpl.mock.calls[0] as unknown as [string])[0]).toBe('https://api.sunoapi.org/api/v1/generate/record-info?taskId=a%2Fb');
  });
});
