import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('탭 화면 레이아웃', () => {
  it('기록이 저장되지 않는 브라우저(사생활 보호 모드)면 이름 짓기 화면에서도 미리 알려준다', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    });
    vi.resetModules();
    const { default: TabsLayout } = await import('./layout');
    render(
      <TabsLayout>
        <p>홈 화면</p>
      </TabsLayout>,
    );
    expect(screen.getByRole('heading', { name: '작은 알 하나가 도착했어요' })).toBeInTheDocument();
    expect(screen.getByText('이 브라우저에서는 기록이 저장되지 않아요. 창을 닫으면 사라져요.')).toBeInTheDocument();
  });
});
