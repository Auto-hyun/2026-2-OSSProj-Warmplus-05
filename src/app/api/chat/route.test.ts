import { POST } from './route';

function post(body: unknown) {
  return POST(new Request('http://localhost/api/chat', { method: 'POST', body: JSON.stringify(body), headers: { 'x-forwarded-for': '10.0.0.1' } }));
}

describe('오목이 대답 API (API 키가 없을 때)', () => {
  beforeEach(() => vi.stubEnv('ANTHROPIC_API_KEY', ''));
  afterEach(() => vi.unstubAllEnvs());

  it('맥락 모양이 이상해도 오류 없이 정해진 말로 답한다', async () => {
    const res = await post({ text: '안녕', context: { moods: [123, { day: 1 }], tests: '테스트', messages: [{ role: 'admin', text: 'x' }] } });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ crisis: false, mode: 'offline' });
  });

  it('최근 마음 날씨가 있으면 정해진 말에 넣는다', async () => {
    const res = await post({ text: '안녕', context: { moods: ['2026-11-17 비(슬픔) 메모: 시험 망침'] } });
    expect((await res.json()).reply).toContain('비(슬픔)');
  });
});
