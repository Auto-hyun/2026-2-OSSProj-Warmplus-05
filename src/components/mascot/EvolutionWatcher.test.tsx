import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const nav = vi.hoisted(() => ({ pathname: '/mission', push: vi.fn() }));
vi.mock('next/navigation', () => ({
  usePathname: () => nav.pathname,
  useRouter: () => ({ push: nav.push }),
}));

beforeEach(() => {
  localStorage.clear();
  nav.push.mockClear();
});

describe('EvolutionWatcher', () => {
  it('실제 단계가 마지막으로 본 단계보다 높으면 지은 이름으로 축하하고, 닫으면 본 것으로 기록한 뒤 홈으로 간다', async () => {
    vi.resetModules();
    const { EvolutionWatcher } = await import('./EvolutionWatcher');
    const { getBrowserStore } = await import('@/lib/storage/useOngi');
    const store = getBrowserStore();
    store.completeNaming('콩이');
    for (let i = 0; i < 3; i++) store.demo.addCompletion(); // 3개 → 2단계
    render(<EvolutionWatcher />);

    expect(screen.getByRole('dialog', { name: '콩이가 자랐어요!' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '홈에서 만나기' }));
    expect(store.getState().profile.lastSeenStage).toBe(2);
    expect(nav.push).toHaveBeenCalledWith('/');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('이미 본 단계면 아무것도 띄우지 않는다', async () => {
    vi.resetModules();
    const { EvolutionWatcher } = await import('./EvolutionWatcher');
    render(<EvolutionWatcher />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
