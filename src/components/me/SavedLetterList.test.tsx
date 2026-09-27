import { render, screen } from '@testing-library/react';
import { SavedLetterList } from './SavedLetterList';

describe('오목이 가방 속 편지', () => {
  it('담은 편지를 최근 것부터 온기레터 화면으로 이어 주고, 아카이브에서 빠진 편지는 건너뛴다', () => {
    render(<SavedLetterList ids={[3475151, 999, 3545925]} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/letters/3475151');
    expect(links[0]).toHaveTextContent('혼자가 아닌데도 자주 외로움을 느껴요');
    expect(links[1]).toHaveAttribute('href', '/letters/3545925');
  });
});
