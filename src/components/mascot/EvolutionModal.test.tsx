import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EvolutionModal } from './EvolutionModal';
import { getStage } from '@/data/stages';

describe('EvolutionModal', () => {
  it('새 단계의 이름·설명과 축하 문구를 보여주고, 버튼을 누르면 닫는다', async () => {
    const onClose = vi.fn();
    render(<EvolutionModal open from={1} to={2} onClose={onClose} />);
    expect(screen.getByRole('dialog', { name: '뱁새가 자랐어요!' })).toBeInTheDocument();
    expect(screen.getByText(getStage(2).name, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(getStage(2).description)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '홈에서 만나기' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('닫혀 있으면 아무것도 그리지 않는다', () => {
    const { container } = render(<EvolutionModal open={false} from={1} to={2} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
