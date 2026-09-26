import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

async function setup({ demoMode, search = '' }: { demoMode: boolean; search?: string }) {
  vi.resetModules();
  window.history.replaceState({}, '', `/${search}`);
  const { DemoPanel } = await import('./DemoPanel');
  const { getBrowserStore } = await import('@/lib/storage/useOngi');
  const store = getBrowserStore();
  if (demoMode) store.demo.setEnabled(true);
  const utils = render(<DemoPanel />);
  return { store, ...utils };
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-26T01:00:00Z'));
});
afterEach(() => vi.useRealTimers());

describe('DemoPanel', () => {
  it('시연 모드가 아니면 아무것도 그리지 않는다', async () => {
    const { container } = await setup({ demoMode: false });
    expect(container).toBeEmptyDOMElement();
  });

  it('주소에 ?demo=1이 있으면 시연 모드를 켠다', async () => {
    const { store } = await setup({ demoMode: false, search: '?demo=1' });
    expect(store.getState().settings.demoMode).toBe(true);
    expect(await screen.findByRole('button', { name: '시연 모드' })).toBeInTheDocument();
  });

  it('미션 +1은 누적을 늘리고, 단계 버튼은 표시 단계만 바꾼다', async () => {
    const { store } = await setup({ demoMode: true });
    await userEvent.click(screen.getByRole('button', { name: '시연 모드' }));
    await userEvent.click(screen.getByRole('button', { name: '미션 +1' }));
    expect(Object.keys(store.getState().missions.records)).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: '4단계로 보기' }));
    expect(store.getState().settings.stageOverride).toBe(4);
    await userEvent.click(screen.getByRole('button', { name: '단계 표시 해제' }));
    expect(store.getState().settings.stageOverride).toBeNull();
  });

  it('날짜를 하루 옮기고 되돌린다', async () => {
    const { store } = await setup({ demoMode: true });
    await userEvent.click(screen.getByRole('button', { name: '시연 모드' }));
    await userEvent.click(screen.getByRole('button', { name: '날짜 +1일' }));
    expect(store.todayKey()).toBe('2026-09-27');
    expect(screen.getByText(/오늘 09-27/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '날짜 되돌리기' }));
    expect(store.todayKey()).toBe('2026-09-26');
  });

  it('기록 초기화 후에도 시연 모드는 유지하고, 끄기를 누르면 사라진다', async () => {
    const { store } = await setup({ demoMode: true });
    await userEvent.click(screen.getByRole('button', { name: '시연 모드' }));
    await userEvent.click(screen.getByRole('button', { name: '미션 +1' }));
    await userEvent.click(screen.getByRole('button', { name: '기록 초기화' }));
    expect(Object.keys(store.getState().missions.records)).toHaveLength(0);
    expect(store.getState().settings.demoMode).toBe(true);
    await userEvent.click(screen.getByRole('button', { name: '시연 모드 끄기' }));
    act(() => {});
    expect(store.getState().settings.demoMode).toBe(false);
    expect(screen.queryByRole('button', { name: '시연 모드' })).not.toBeInTheDocument();
  });
});
