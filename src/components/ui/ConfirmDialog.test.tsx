import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('열리면 창으로 포커스가 옮겨지고, ESC를 누르면 취소한다', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog open title="지울까요?" confirmLabel="지우기" onConfirm={() => {}} onCancel={onCancel} />);
    expect(screen.getByRole('alertdialog', { name: '지울까요?' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('열려 있는 동안 뒤 화면이 스크롤되지 않는다', () => {
    const { unmount } = render(
      <ConfirmDialog open title="지울까요?" confirmLabel="지우기" onConfirm={() => {}} onCancel={() => {}} />,
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
