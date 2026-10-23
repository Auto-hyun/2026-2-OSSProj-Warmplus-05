import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WORDS } from '@/data/words';
import { WordMethod } from './WordMethod';
import { hexSpiral } from './WordCloud';

describe('hexSpiral', () => {
  it('가운데에서 시작해 겹치지 않는 칸을 n개 만든다', () => {
    const cells = hexSpiral(24);
    expect(cells).toHaveLength(24);
    expect(cells[0]).toEqual({ q: 0, r: 0 });
    expect(new Set(cells.map((c) => `${c.q},${c.r}`)).size).toBe(24);
  });

  it('첫 고리 6칸은 모두 가운데와 맞닿아 있다', () => {
    const ring = hexSpiral(7).slice(1);
    // axial 좌표에서 이웃까지의 거리는 1
    ring.forEach(({ q, r }) => expect((Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2).toBe(1));
  });
});

describe('WordMethod', () => {
  it('모든 감정 단어가 방울로 나오고, 3개까지만 고를 수 있다', async () => {
    render(<WordMethod busy={false} onCompose={() => {}} />);
    const bubbles = screen.getAllByRole('button', { pressed: false });
    expect(bubbles).toHaveLength(WORDS.length);

    for (const label of ['슬픔', '행복', '평온', '불안']) {
      await userEvent.click(screen.getByRole('button', { name: label }));
    }
    expect(screen.getAllByRole('button', { pressed: true }).map((b) => b.textContent)).toEqual(['슬픔', '행복', '평온']);

    await userEvent.click(screen.getByRole('button', { name: '슬픔' }));
    expect(screen.getByRole('button', { name: '슬픔' })).toHaveAttribute('aria-pressed', 'false');
  });
});
