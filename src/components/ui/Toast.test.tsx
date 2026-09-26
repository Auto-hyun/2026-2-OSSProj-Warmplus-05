import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast, useToast } from './Toast';

function Harness() {
  const { toast, showToast } = useToast(2000);
  return (
    <>
      <button type="button" onClick={() => showToast('저장했어요')}>
        보이기
      </button>
      <Toast message={toast} />
    </>
  );
}

afterEach(() => vi.useRealTimers());

describe('Toast', () => {
  it('메시지를 잠시 보여줬다가 사라지고, 다시 보이면 시간을 새로 센다', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: '보이기' }));
    expect(screen.getByRole('status')).toHaveTextContent('저장했어요');

    act(() => vi.advanceTimersByTime(1500));
    await user.click(screen.getByRole('button', { name: '보이기' }));
    act(() => vi.advanceTimersByTime(1500));
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(600));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
