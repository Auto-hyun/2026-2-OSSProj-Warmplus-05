import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mascot } from './Mascot';

describe('Mascot', () => {
  it('단계 이름을 대체 텍스트로 쓴다', () => {
    render(<Mascot stage={3} size="md" />);
    expect(screen.getByRole('img', { name: '어린 뱁새' })).toBeInTheDocument();
  });

  it('1단계 알은 윗껍질이 따로 움직이도록 두 겹으로 그린다', () => {
    const { container } = render(<Mascot stage={1} size="lg" />);
    expect(container.querySelectorAll('img')).toHaveLength(2);
    expect(screen.getAllByRole('img', { name: '알 (부화 전)' })).toHaveLength(1);
  });

  it('장식용이면 대체 텍스트를 비운다', () => {
    const { container } = render(<Mascot stage={5} size="sm" decorative />);
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });

  it('누를 수 있으면 지은 이름으로 인사 버튼 이름을 붙인다', () => {
    render(<Mascot stage={4} size="lg" interactive name="별" />);
    expect(screen.getByRole('button', { name: '별과 인사하기' })).toBeInTheDocument();
  });

  it('누르면 짧은 한마디를 한다', async () => {
    render(<Mascot stage={4} size="lg" interactive />);
    await userEvent.click(screen.getByRole('button', { name: '뱁새와 인사하기' }));
    expect(screen.getByRole('status')).toHaveTextContent(/.+/);
  });
});
