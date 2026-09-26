import { render, screen } from '@testing-library/react';

const nav = vi.hoisted(() => ({ date: null as string | null }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(nav.date ? { date: nav.date } : {}),
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-26T01:00:00Z'));
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => vi.useRealTimers());

async function renderScreen() {
  vi.resetModules();
  const { ChatScreen } = await import('./ChatScreen');
  render(<ChatScreen />);
}

describe('ChatScreen (?date=)', () => {
  it('주소에 날짜가 없으면 오늘 대화를 연다', async () => {
    nav.date = null;
    await renderScreen();
    expect(screen.getByRole('textbox', { name: '메시지 입력' })).toBeInTheDocument();
  });

  it('지난 날짜면 읽기 전용으로 연다', async () => {
    nav.date = '2026-09-20';
    await renderScreen();
    expect(screen.getByText('지난 대화예요')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: '메시지 입력' })).not.toBeInTheDocument();
  });

  it('없는 날짜(2026-13-45)면 오늘 대화로 연다', async () => {
    nav.date = '2026-13-45';
    await renderScreen();
    expect(screen.getByRole('textbox', { name: '메시지 입력' })).toBeInTheDocument();
    expect(screen.queryByText(/13월/)).not.toBeInTheDocument();
  });
});
