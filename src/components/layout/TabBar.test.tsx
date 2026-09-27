import { render, screen } from '@testing-library/react';
import { TabBar } from './TabBar';

const nav = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => nav.pathname }));

const LABELS = ['미션', '심리테스트', '홈', '온기레터', '나의 온기'];

function currentTabs(): string[] {
  return LABELS.filter((label) => screen.getByRole('link', { name: label }).getAttribute('aria-current') === 'page');
}

describe('TabBar', () => {
  it('탭 5개가 순서대로 있다 (홈은 가운데)', () => {
    render(<TabBar />);
    expect(screen.getAllByRole('link').map((a) => a.textContent)).toEqual(LABELS);
  });

  it.each([
    ['/', '홈'],
    ['/mission', '미션'],
    ['/tests', '심리테스트'],
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
