import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryChips } from './CategoryChips';
import { LetterCard } from './LetterCard';
import type { Letter } from '@/lib/letters';

const nav = vi.hoisted(() => ({ category: null as string | null, replace: vi.fn() }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(nav.category ? { category: nav.category } : {}),
  useRouter: () => ({ replace: nav.replace, push: vi.fn(), back: vi.fn() }),
}));

const letter: Letter = {
  id: 3557158,
  pid: 214,
  title: '사랑하는 사람의 힘든 시간, 어떻게 함께 하면 좋을까요? 🧶',
  preview: '사랑은 서로에게 기대며 함께 걸어가는 것이 아닐까요?',
  link: 'https://stib.ee/yg2O',
  sentAt: '2026-08-28T20:00:01+09:00',
  category: 'love',
};

describe('CategoryChips', () => {
  it('전체 + 카테고리 10개, 선택된 칩은 눌린 상태', () => {
    render(<CategoryChips value="love" onChange={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(11);
    expect(screen.getByRole('button', { name: '연애·사랑' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('칩을 누르면 그 카테고리를 알려준다', async () => {
    const onChange = vi.fn();
    render(<CategoryChips value="all" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: '가족' }));
    expect(onChange).toHaveBeenCalledWith('family');
  });
});

describe('LetterCard', () => {
  it('제목·카테고리·날짜를 보여주고 상세로 연결된다', () => {
    render(<LetterCard letter={letter} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/letters/3557158');
    expect(within(link).getByText(letter.title)).toBeInTheDocument();
    expect(within(link).getByText('연애·사랑')).toBeInTheDocument();
    expect(within(link).getByText('2026.08.28')).toBeInTheDocument();
  });

  it('그림이 없으면 제목 속 이모지로 기본 카드를 그린다', () => {
    const { container } = render(<LetterCard letter={letter} />);
    expect(screen.getByText('🧶')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });

  it('그림이 있으면 그림을 보여준다', () => {
    const { container } = render(<LetterCard letter={{ ...letter, image: '/letters/3557158.webp' }} />);
    expect(container.querySelector('img')).not.toBeNull();
  });
});

describe('LettersScreen', () => {
  it('주소의 카테고리로 걸러서 최신순으로 보여주고, 칩을 누르면 주소를 바꾼다', async () => {
    nav.category = 'family';
    const { LettersScreen } = await import('./LettersScreen');
    const { default: all } = await import('@/data/letters.json');
    const family = (all as Letter[]).filter((l) => l.category === 'family');
    render(<LettersScreen />);
    const links = screen.getAllByRole('link', { name: /./ }).filter((a) => a.getAttribute('href')?.startsWith('/letters/'));
    expect(links).toHaveLength(family.length);
    expect(links[0]).toHaveTextContent(family[0].title);

    await userEvent.click(screen.getByRole('button', { name: '전체' }));
    expect(nav.replace).toHaveBeenCalledWith('/letters', { scroll: false });
  });

  it('모르는 카테고리면 전체를 보여준다', async () => {
    nav.category = 'nope';
    const { LettersScreen } = await import('./LettersScreen');
    const { default: all } = await import('@/data/letters.json');
    render(<LettersScreen />);
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(`익명의 고민과 손편지 답장을 모았어요 · ${(all as Letter[]).length}편`)).toBeInTheDocument();
  });
});
