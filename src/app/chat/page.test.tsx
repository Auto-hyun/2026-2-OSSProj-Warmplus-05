import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

beforeEach(() => {
  localStorage.clear();
  Element.prototype.scrollIntoView = vi.fn();
});

describe('대화 페이지', () => {
  it('탭 제목은 홈 버튼과 같은 "내 생각 얘기하기"', async () => {
    const { metadata } = await import('./page');
    expect(metadata.title).toBe('내 생각 얘기하기 · 온기');
  });

  it('처음 실행이면 주소로 바로 들어와도 대화보다 이름 짓기를 먼저 보여준다', async () => {
    vi.resetModules();
    const { default: ChatPage } = await import('./page');
    render(<ChatPage />);
    expect(await screen.findByRole('heading', { name: '작은 알 하나가 도착했어요' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: '메시지 입력' })).not.toBeInTheDocument();
  });
});
