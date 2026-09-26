import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

beforeEach(() => localStorage.clear());

// 브라우저 스토어 싱글턴을 테스트마다 새로 만들기 위해 모듈을 다시 불러온다
async function renderErrorPage() {
  vi.resetModules();
  const { default: ErrorPage } = await import('./error');
  const { getBrowserStore } = await import('@/lib/storage/useOngi');
  const retry = vi.fn();
  render(<ErrorPage error={new Error('boom')} retry={retry} />);
  return { retry, store: getBrowserStore() };
}

describe('오류 화면', () => {
  it('다시 시도를 누르면 화면을 다시 그린다', async () => {
    const { retry } = await renderErrorPage();
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('기록 초기화는 한 번 더 물어본 뒤 이 기기의 기록을 지우고 다시 그린다', async () => {
    const { retry, store } = await renderErrorPage();
    store.completeNaming('콩이');

    await userEvent.click(screen.getByRole('button', { name: '기록 초기화' }));
    expect(store.getState().profile.birdName).toBe('콩이');
    expect(retry).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: '초기화하기' }));
    expect(store.getState().profile.named).toBe(false);
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('초기화를 취소하면 기록을 그대로 둔다', async () => {
    const { store } = await renderErrorPage();
    store.completeNaming('콩이');
    await userEvent.click(screen.getByRole('button', { name: '기록 초기화' }));
    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(store.getState().profile.birdName).toBe('콩이');
    expect(screen.getByRole('button', { name: '기록 초기화' })).toBeInTheDocument();
  });
});
