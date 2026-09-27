import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

type Store = import('@/lib/storage/store').OngiStore;

/** 기록이 저장되지 않는 브라우저(사생활 보호 모드)에서 처음 실행 단계를 prepare까지 진행해 그린다 */
async function renderPrivate(prepare: (store: Store) => void) {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('QuotaExceededError', 'QuotaExceededError');
  });
  vi.resetModules();
  const { default: TabsLayout } = await import('./layout');
  const { getBrowserStore } = await import('@/lib/storage/useOngi');
  prepare(getBrowserStore());
  render(
    <TabsLayout>
      <p>홈 화면</p>
    </TabsLayout>,
  );
}

const NOT_SAVED = '이 브라우저에서는 기록이 저장되지 않아요. 창을 닫으면 사라져요.';

describe('탭 화면 레이아웃', () => {
  it('기록이 저장되지 않는 브라우저(사생활 보호 모드)면 처음 카카오 로그인 화면에서부터 미리 알려준다', async () => {
    await renderPrivate(() => {});
    expect(screen.getByRole('button', { name: '카카오로 시작하기' })).toBeInTheDocument();
    expect(screen.getByText(NOT_SAVED)).toBeInTheDocument();
  });

  it('로그인 뒤 이름 짓기 화면에서도 저장되지 않는다고 알려준다', async () => {
    await renderPrivate((store) => store.completeLogin());
    expect(screen.getByRole('heading', { name: '작은 알 하나가 도착했어요' })).toBeInTheDocument();
    expect(screen.getByText(NOT_SAVED)).toBeInTheDocument();
  });

  it('이름을 지은 뒤 시작 화면(편지 도착)에서는 상단 바에 한 번만 알려준다 (화면 읽기 프로그램이 두 번 읽지 않게)', async () => {
    await renderPrivate((store) => {
      store.completeLogin();
      store.completeNaming('콩이');
    });
    expect(screen.getByRole('heading', { name: /오늘 당신에게 도착한 게 있어요/ })).toBeInTheDocument();
    expect(screen.getByText(NOT_SAVED)).toBeInTheDocument();
  });
});
