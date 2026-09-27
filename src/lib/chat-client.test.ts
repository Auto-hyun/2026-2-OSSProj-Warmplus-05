// @vitest-environment node
import { QUICK_REPLIES, ReplyError, buildRequestMessages, requestReply } from './chat-client';
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

  it('서버 허용 길이(사용자 1,000자·오목이 2,000자)보다 긴 저장 메시지는 잘라서 보낸다 (그날 대화가 계속 실패하지 않게)', () => {
    const long: StoredMessage[] = [
      { role: 'user', content: '가'.repeat(1500), at: '' },
      { role: 'assistant', content: '나'.repeat(2500), at: '' },
    ];
    const [, user, assistant] = buildRequestMessages('Q', long);
    expect(user.content).toHaveLength(1000);
    expect(assistant.content).toHaveLength(2000);
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

  it('서버 오류(5xx)는 다시 보낼 수 있는 오류다', async () => {
    const fetchImpl = async () => Response.json({ error: '답장을 만들지 못했어요.' }, { status: 502 });
    const error = await requestReply(req, () => {}, fetchImpl as unknown as typeof fetch).catch((e) => e);
    expect(error).toBeInstanceOf(ReplyError);
    expect(error).toMatchObject({ message: '답장을 만들지 못했어요.', retryable: true });
  });

  it('요청 형식 오류(4xx)는 다시 보내도 안 되는 오류다', async () => {
    const fetchImpl = async () => Response.json({ error: '메시지는 1,000자까지 보낼 수 있어요.' }, { status: 400 });
    const error = await requestReply(req, () => {}, fetchImpl as unknown as typeof fetch).catch((e) => e);
    expect(error).toMatchObject({ message: '메시지는 1,000자까지 보낼 수 있어요.', retryable: false });
  });

  it('인터넷이 끊기면 다시 보낼 수 있는 오류다', async () => {
    const fetchImpl = async () => {
      throw new TypeError('Failed to fetch');
    };
    const error = await requestReply(req, () => {}, fetchImpl as unknown as typeof fetch).catch((e) => e);
    expect(error).toMatchObject({ retryable: true });
  });

  describe('응답 대기 시간 제한', () => {
    afterEach(() => vi.useRealTimers());

    it('30초 동안 응답이 없으면 멈추고 다시 보낼 수 있게 한다', async () => {
      vi.useFakeTimers();
      const fetchImpl = (_url: string, init: RequestInit) =>
        new Promise<Response>((_, reject) => {
          init.signal!.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
        });
      const pending = requestReply(req, () => {}, fetchImpl as unknown as typeof fetch).catch((e) => e);
      await vi.advanceTimersByTimeAsync(30_000);
      expect(await pending).toMatchObject({ message: '답장이 늦어지고 있어요. 다시 보내 주세요.', retryable: true });
    });

    it('답장이 오다가 30초 동안 끊기면 멈춘다', async () => {
      vi.useFakeTimers();
      const encoder = new TextEncoder();
      const stuck = new Response(
        new ReadableStream<Uint8Array>({
          start(c) {
            c.enqueue(encoder.encode('온기님,'));
          },
        }),
        { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
      );
      const onChunk = vi.fn();
      const pending = requestReply(req, onChunk, (async () => stuck) as unknown as typeof fetch).catch((e) => e);
      await vi.advanceTimersByTimeAsync(30_000);
      expect(onChunk).toHaveBeenCalledWith('온기님,');
      expect(await pending).toMatchObject({ retryable: true });
    });
  });
});
