import { render } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/events';
import { PageViews } from './PageViews';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));
vi.mock('@/lib/events', () => ({ track: vi.fn() }));

describe('화면 열기 기록', () => {
  it('화면 주소가 바뀔 때마다 page_view를 남긴다', () => {
    vi.mocked(usePathname).mockReturnValue('/map');
    const { rerender } = render(<PageViews />);
    vi.mocked(usePathname).mockReturnValue('/create');
    rerender(<PageViews />);
    expect(vi.mocked(track).mock.calls).toEqual([
      ['page_view', { path: '/map' }],
      ['page_view', { path: '/create' }],
    ]);
  });
});
