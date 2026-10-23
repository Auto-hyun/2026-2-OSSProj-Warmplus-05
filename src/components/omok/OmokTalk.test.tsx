import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OmokTalk } from './OmokTalk';

describe('OmokTalk', () => {
  it('한 마디와 대답 버튼을 함께 보여 준다', () => {
    render(<OmokTalk line="테스트 해 볼래?" replies={[{ label: '좋아', href: '/tests/example' }]} />);
    expect(screen.getByText('테스트 해 볼래?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '좋아' })).toHaveAttribute('href', '/tests/example');
  });

  it('대답을 고르면 onSelect가 불린다', async () => {
    const onSelect = vi.fn();
    render(<OmokTalk size="sm" line="한 줄" replies={[{ label: '다음에 할래', onSelect }]} />);
    await userEvent.click(screen.getByRole('button', { name: '다음에 할래' }));
    expect(onSelect).toHaveBeenCalled();
  });
});
