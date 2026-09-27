import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

type Store = import('@/lib/storage/store').OngiStore;

/** 기본: 카카오 로그인 화면은 지난 상태 */
async function setup(prepare: (store: Store) => void = (store) => store.completeLogin()) {
  vi.resetModules();
  const { NamingGate } = await import('./NamingGate');
  const { getBrowserStore } = await import('@/lib/storage/useOngi');
  const store = getBrowserStore();
  prepare(store);
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

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('NamingGate (처음 실행: 카카오 로그인 → 이름 짓기 → 편지 도착)', () => {
  it('처음 방문이면 앱 화면 대신 카카오 로그인 화면부터 보여준다', async () => {
    await setup(() => {});
    expect(screen.getByRole('button', { name: '카카오로 시작하기' })).toBeInTheDocument();
    expect(screen.queryByText('앱 화면')).not.toBeInTheDocument();
  });

  it('카카오로 시작하기를 누르면 이름 짓기로 넘어간다 (지금은 화면만 있는 시연용 로그인)', async () => {
    const store = await setup(() => {});
    await userEvent.click(screen.getByRole('button', { name: '카카오로 시작하기' }));
    expect(store.getState().profile.signedIn).toBe(true);
    expect(screen.getByRole('heading', { name: '작은 알 하나가 도착했어요' })).toBeInTheDocument();
    expect(screen.queryByText('앱 화면')).not.toBeInTheDocument();
  });

  it('이름을 적고 지어주면 저장하고 시작 화면(편지 도착)으로 넘어간다', async () => {
    const store = await setup();
    await userEvent.type(screen.getByRole('textbox', { name: '오목이 이름' }), '콩이');
    await userEvent.click(screen.getByRole('button', { name: '이름 지어주기' }));
    expect(store.getState().profile).toMatchObject({ birdName: '콩이', named: true });
    expect(screen.getByRole('heading', { name: /오늘 당신에게 도착한 게 있어요/ })).toBeInTheDocument();
    expect(screen.queryByText('앱 화면')).not.toBeInTheDocument();
  });

  it('추천 이름을 누르면 입력칸에 채워진다', async () => {
    await setup();
    await userEvent.click(screen.getByRole('button', { name: '보리' }));
    expect(screen.getByRole('textbox', { name: '오목이 이름' })).toHaveValue('보리');
  });

  it('빈 이름은 지을 수 없다', async () => {
    await setup();
    expect(screen.getByRole('button', { name: '이름 지어주기' })).toBeDisabled();
    await userEvent.type(screen.getByRole('textbox', { name: '오목이 이름' }), '   ');
    expect(screen.getByRole('button', { name: '이름 지어주기' })).toBeDisabled();
  });

  it('나중에 할게요를 누르면 오목이라는 이름으로 시작 화면을 본다', async () => {
    const store = await setup();
    await userEvent.click(screen.getByRole('button', { name: /나중에 할게요/ }));
    expect(store.getState().profile).toMatchObject({ birdName: '오목이', named: true });
    expect(screen.getByRole('heading', { name: /오늘 당신에게 도착한 게 있어요/ })).toBeInTheDocument();
  });

  it('로그인·이름 짓기·시작 화면을 모두 마쳤으면 바로 앱 화면을 보여준다', async () => {
    await setup((store) => {
      store.completeLogin();
      store.completeNaming('콩이');
      store.completeIntro();
    });
    expect(screen.getByText('앱 화면')).toBeInTheDocument();
  });

  it('로그인 화면이 생기기 전부터 쓰던 사람은 로그인 화면만 한 번 지나면 바로 앱으로 간다', async () => {
    await setup((store) => {
      store.completeNaming('콩이');
      store.completeIntro();
    });
    await userEvent.click(screen.getByRole('button', { name: '카카오로 시작하기' }));
    expect(screen.getByText('앱 화면')).toBeInTheDocument();
  });
});
