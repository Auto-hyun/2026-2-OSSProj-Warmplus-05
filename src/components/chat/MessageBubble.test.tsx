import { render, screen } from '@testing-library/react';
import { MessageBubble } from './MessageBubble';

describe('MessageBubble', () => {
  it('답장을 기다리는 동안 지은 이름으로 쓰는 중이라고 알린다', () => {
    render(<MessageBubble role="assistant" content="" pending name="콩이" />);
    expect(screen.getByRole('status', { name: '콩이가 답장을 쓰는 중' })).toBeInTheDocument();
  });
});
