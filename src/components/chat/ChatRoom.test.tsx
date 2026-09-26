import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({ useRouter: () => ({ back: vi.fn(), push: vi.fn() }) }));

const TODAY = '2026-09-26';

function streamResponse(text: string): Response {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(encoder.encode(text));
        c.close();
      },
    }),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}

// 브라우저 스토어 싱글턴을 테스트마다 새로 만들기 위해 모듈을 다시 불러온다
async function renderRoom(props: { readOnly?: boolean } = {}) {
  vi.resetModules();
  const { ChatRoom } = await import('./ChatRoom');
  const { getBrowserStore } = await import('@/lib/storage/useOngi');
  render(<ChatRoom date={TODAY} question="오늘 마음 날씨는 어떤가요?" readOnly={props.readOnly ?? false} />);
  return getBrowserStore();
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-26T01:00:00Z'));
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('ChatRoom', () => {
  it('질문과 빠른 답을 보여주고, 빠른 답을 누르면 보내고 답장을 받는다', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => streamResponse('많이 지치셨군요, 온기님. 오늘은 어땠나요?')));
    const store = await renderRoom();
    expect(screen.getByText('오늘 마음 날씨는 어떤가요?')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '그냥 좀 지쳤어요' }));

    expect(await screen.findByText('많이 지치셨군요, 온기님. 오늘은 어땠나요?')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '잘 모르겠어요' })).not.toBeInTheDocument();
    expect(store.getState().chats[TODAY].messages.map((m) => m.role)).toEqual(['user', 'assistant']);
  });

  it('위기 안내 응답이면 도움받을 수 있는 곳 카드를 붙인다', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ type: 'safety', message: '전문가와 이야기해 주세요.' })));
    await renderRoom();
    await userEvent.type(screen.getByRole('textbox', { name: '메시지 입력' }), '죽고 싶어');
    await userEvent.click(screen.getByRole('button', { name: '보내기' }));
    expect(await screen.findByText('전문가와 이야기해 주세요.')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '도움받을 수 있는 곳' })).toBeInTheDocument();
  });

  it('답장을 못 받으면 다시 보내기를 보여준다', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: '오류' }, { status: 502 })));
    await renderRoom();
    await userEvent.click(screen.getByRole('button', { name: '잘 모르겠어요' }));
    expect(await screen.findByRole('button', { name: '다시 보내기' })).toBeInTheDocument();
  });

  it('사용자 메시지가 3개가 되면 온기우편함 연결 카드를 한 번 보여준다', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => streamResponse('그렇군요, 온기님?')));
    const store = await renderRoom();
    const input = screen.getByRole('textbox', { name: '메시지 입력' });
    for (const text of ['하나', '둘', '셋']) {
      await userEvent.type(input, text);
      await userEvent.click(screen.getByRole('button', { name: '보내기' }));
      await waitFor(() => expect(store.getState().chats[TODAY].messages.at(-1)?.role).toBe('assistant'));
    }
    expect(await screen.findByText('이 이야기, 손편지로 답장받고 싶다면?')).toBeInTheDocument();
    expect(store.getState().chats[TODAY].bridgeShown).toBe(true);
  });

  it('위기 안내 답장 바로 뒤에는 온기우편함 카드를 보여주지 않는다', async () => {
    const replies = [streamResponse('그렇군요?'), streamResponse('그렇군요?'), Response.json({ type: 'safety', message: '전문가와 이야기해 주세요.' })];
    vi.stubGlobal('fetch', vi.fn(async () => replies.shift() ?? streamResponse('그렇군요?')));
    const store = await renderRoom();
    const input = screen.getByRole('textbox', { name: '메시지 입력' });
    for (const text of ['하나', '둘', '죽고 싶어']) {
      await userEvent.type(input, text);
      await userEvent.click(screen.getByRole('button', { name: '보내기' }));
      await waitFor(() => expect(store.getState().chats[TODAY].messages.at(-1)?.role).toBe('assistant'));
    }
    expect(screen.getByRole('region', { name: '도움받을 수 있는 곳' })).toBeInTheDocument();
    expect(screen.queryByText('이 이야기, 손편지로 답장받고 싶다면?')).not.toBeInTheDocument();
    expect(store.getState().chats[TODAY].bridgeShown).toBe(false);
  });

  it('지난 대화는 읽기만 한다', async () => {
    await renderRoom({ readOnly: true });
    expect(screen.queryByRole('textbox', { name: '메시지 입력' })).not.toBeInTheDocument();
    expect(screen.getByText('지난 대화예요')).toBeInTheDocument();
  });
});
