// @vitest-environment node
import { QUICK_REPLIES, buildRequestMessages, requestReply } from './chat-client';
import type { StoredMessage } from './storage/types';

function messages(n: number): StoredMessage[] {
  return Array.from({ length: n }, (_, i) => ({
    role: i % 2 === 0 ? 'user' : 'assistant',
    content: `m${i + 1}`,
    at: '2026-09-26T01:00:00.000Z',
  }));
}

function streamResponse(chunks: string[]): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((c) => controller.enqueue(encoder.encode(c)));
      controller.close();
    },
  });
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

describe('QUICK_REPLIES', () => {
  it('처음 말을 꺼내기 쉬운 빠른 답 3개', () => {
    expect(QUICK_REPLIES).toEqual(['잘 모르겠어요', '그냥 좀 지쳤어요', '좋은 일이 있었어요']);
  });
});

describe('buildRequestMessages', () => {
  it('질문을 맨 앞에 두고 필요한 필드만 남긴다', () => {
    expect(buildRequestMessages('Q', messages(2))).toEqual([
      { role: 'assistant', content: 'Q' },
      { role: 'user', content: 'm1' },
      { role: 'assistant', content: 'm2' },
    ]);
  });

  it('대화가 길면 질문 + 최근 20개만 보낸다', () => {
    const result = buildRequestMessages('Q', messages(60));
    expect(result).toHaveLength(21);
    expect(result[0]).toEqual({ role: 'assistant', content: 'Q' });
    expect(result[1].content).toBe('m41');
    expect(result[20].content).toBe('m60');
  });
});

describe('requestReply', () => {
  const req = [{ role: 'user' as const, content: '안녕' }];

  it('text/plain 스트림을 조각마다 알려주고 전체 답장을 준다', async () => {
    const onChunk = vi.fn();
    const fetchImpl = vi.fn(async () => streamResponse(['온기님, ', '반가워요?']));
    const result = await requestReply(req, onChunk, fetchImpl as unknown as typeof fetch);
    expect(result).toEqual({ type: 'text', text: '온기님, 반가워요?' });
    expect(onChunk.mock.calls.map((c) => c[0]).join('')).toBe('온기님, 반가워요?');
    expect(fetchImpl).toHaveBeenCalledWith('/api/chat', expect.objectContaining({ method: 'POST' }));
  });

  it('위기 안내 JSON이면 safety 결과를 준다', async () => {
    const fetchImpl = async () => Response.json({ type: 'safety', message: '안내' });
    await expect(requestReply(req, () => {}, fetchImpl as unknown as typeof fetch)).resolves.toEqual({
      type: 'safety',
      message: '안내',
    });
  });

  it('서버 오류면 예외를 던진다', async () => {
    const fetchImpl = async () => Response.json({ error: '답장을 만들지 못했어요.' }, { status: 502 });
    await expect(requestReply(req, () => {}, fetchImpl as unknown as typeof fetch)).rejects.toThrow('답장을 만들지 못했어요.');
  });
});
