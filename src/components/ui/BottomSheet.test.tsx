import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomSheet } from './BottomSheet';

/** 부모가 입력할 때마다 다시 그려지면서 onClose가 매번 새 함수가 되는 상황 */
function Harness({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState('');
  return (
    <BottomSheet open title="시트" onClose={() => onClose()}>
      <input aria-label="입력" value={text} onChange={(e) => setText(e.target.value)} />
    </BottomSheet>
  );
}

describe('BottomSheet', () => {
  it('열려 있는 동안 부모가 다시 그려져도 입력 중인 포커스를 빼앗지 않는다', async () => {
    render(<Harness onClose={() => {}} />);
    await userEvent.type(screen.getByRole('textbox', { name: '입력' }), '콩이네');
    expect(screen.getByRole('textbox', { name: '입력' })).toHaveValue('콩이네');
  });

  it('ESC와 닫기 버튼으로 닫힌다', async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
