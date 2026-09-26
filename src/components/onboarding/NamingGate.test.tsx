import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

async function setup(prepare?: (store: import('@/lib/storage/store').OngiStore) => void) {
  vi.resetModules();
  const { NamingGate } = await import('./NamingGate');
  const { getBrowserStore } = await import('@/lib/storage/useOngi');
  const store = getBrowserStore();
  prepare?.(store);
  render(
    <NamingGate>
      <p>앱 화면</p>
    </NamingGate>,
  );
  return store;
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-26T01:00:00Z'));
});
afterEach(() => vi.useRealTimers());

describe('NamingGate (처음 실행 시 뱁새 이름 짓기)', () => {
  it('아직 이름을 짓지 않았으면 앱 화면 대신 이름 짓기 화면을 보여준다', async () => {
    await setup();
    expect(screen.getByRole('heading', { name: '작은 알 하나가 도착했어요' })).toBeInTheDocument();
    expect(screen.queryByText('앱 화면')).not.toBeInTheDocument();
  });

  it('이름을 적고 지어주면 저장하고 앱 화면으로 넘어간다', async () => {
    const store = await setup();
    await userEvent.type(screen.getByRole('textbox', { name: '뱁새 이름' }), '콩이');
    await userEvent.click(screen.getByRole('button', { name: '이름 지어주기' }));
    expect(store.getState().profile).toMatchObject({ birdName: '콩이', named: true });
    expect(screen.getByText('앱 화면')).toBeInTheDocument();
  });

  it('추천 이름을 누르면 입력칸에 채워진다', async () => {
    await setup();
    await userEvent.click(screen.getByRole('button', { name: '보리' }));
    expect(screen.getByRole('textbox', { name: '뱁새 이름' })).toHaveValue('보리');
  });

  it('빈 이름은 지을 수 없다', async () => {
    await setup();
    expect(screen.getByRole('button', { name: '이름 지어주기' })).toBeDisabled();
    await userEvent.type(screen.getByRole('textbox', { name: '뱁새 이름' }), '   ');
    expect(screen.getByRole('button', { name: '이름 지어주기' })).toBeDisabled();
  });

  it('나중에 할게요를 누르면 뱁새라는 이름으로 넘어간다', async () => {
    const store = await setup();
    await userEvent.click(screen.getByRole('button', { name: /나중에 할게요/ }));
    expect(store.getState().profile).toMatchObject({ birdName: '뱁새', named: true });
    expect(screen.getByText('앱 화면')).toBeInTheDocument();
  });

  it('이미 이름을 지었으면 바로 앱 화면을 보여준다', async () => {
    await setup((store) => store.completeNaming('콩이'));
    expect(screen.getByText('앱 화면')).toBeInTheDocument();
  });
});
