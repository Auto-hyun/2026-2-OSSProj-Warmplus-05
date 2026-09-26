// @vitest-environment node
import { POST } from './route';
import { SAFETY_MESSAGE } from '@/lib/safety';

const question = { role: 'assistant', content: '오늘 마음 날씨는 어떤가요?' };

function post(body: unknown, raw?: string): Request {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw ?? JSON.stringify(body),
  });
}

const env = { ...process.env };

beforeEach(() => {
  process.env.LLM_PROVIDER = 'mock';
  process.env.MOCK_DELAY_MS = '0';
});

afterEach(() => {
  process.env = { ...env };
});

describe('POST /api/chat', () => {
  it('정상 요청이면 text/plain으로 답장을 흘려보낸다', async () => {
    const res = await POST(post({ messages: [question, { role: 'user', content: '조금 피곤해요' }] }));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/plain');
    const text = await res.text();
    expect(text.length).toBeGreaterThan(0);
  });

  it('위기 표현이면 모델 대신 안내 JSON을 준다', async () => {
    const res = await POST(post({ messages: [question, { role: 'user', content: '요즘 죽고 싶어' }] }));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');
    expect(await res.json()).toEqual({ type: 'safety', message: SAFETY_MESSAGE });
  });

  it('1,001자 메시지는 400', async () => {
    const res = await POST(post({ messages: [{ role: 'user', content: '가'.repeat(1001) }] }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBeTruthy();
  });

  it('JSON이 아닌 요청은 400', async () => {
    const res = await POST(post(null, '{not json'));
    expect(res.status).toBe(400);
  });

  it('제공자 설정이 잘못되면 502', async () => {
    process.env.LLM_PROVIDER = 'unknown';
    const res = await POST(post({ messages: [{ role: 'user', content: '안녕' }] }));
    expect(res.status).toBe(502);
  });
});
