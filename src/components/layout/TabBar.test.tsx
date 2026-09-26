import { render, screen } from '@testing-library/react';
import { TabBar } from './TabBar';

const nav = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => nav.pathname }));

const LABELS = ['홈', '미션', '온기레터', '나의 온기'];

function currentTabs(): string[] {
  return LABELS.filter((label) => screen.getByRole('link', { name: label }).getAttribute('aria-current') === 'page');
}

describe('TabBar', () => {
  it('탭 4개가 순서대로 있다', () => {
    render(<TabBar />);
    expect(screen.getAllByRole('link').map((a) => a.textContent)).toEqual(LABELS);
  });

  it.each([
    ['/', '홈'],
    ['/mission', '미션'],
    ['/letters', '온기레터'],
    ['/me', '나의 온기'],
  ])('%s 에서는 %s 탭만 선택된다', (pathname, label) => {
    nav.pathname = pathname;
    render(<TabBar />);
    expect(currentTabs()).toEqual([label]);
  });

  it('하위 경로도 해당 탭을 선택한다', () => {
    nav.pathname = '/letters/3557158';
    render(<TabBar />);
    expect(currentTabs()).toEqual(['온기레터']);
  });
});
