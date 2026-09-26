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

/** 버튼으로 여닫는 시트 (포커스 복귀·스크롤 잠금 확인용) */
function Toggle() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        열기
      </button>
      <BottomSheet open={open} title="시트" onClose={() => setOpen(false)}>
        <input aria-label="이름" />
        <button type="button">저장</button>
      </BottomSheet>
    </>
  );
}

describe('BottomSheet', () => {
  it('열려 있는 동안 뒤 화면이 스크롤되지 않고, 닫히면 원래대로 돌아간다', async () => {
    render(<Toggle />);
    await userEvent.click(screen.getByRole('button', { name: '열기' }));
    expect(document.body.style.overflow).toBe('hidden');
    await userEvent.keyboard('{Escape}');
    expect(document.body.style.overflow).toBe('');
  });

  it('열리면 시트로 포커스가 옮겨지고, 닫히면 열기 전에 누른 버튼으로 돌아간다', async () => {
    render(<Toggle />);
    await userEvent.click(screen.getByRole('button', { name: '열기' }));
    expect(screen.getByRole('dialog', { name: '시트' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: '열기' })).toHaveFocus();
  });

  it('Tab 키는 시트 안에서만 돈다', async () => {
    render(<Toggle />);
    await userEvent.click(screen.getByRole('button', { name: '열기' }));
    await userEvent.tab();
    expect(screen.getByRole('button', { name: '닫기' })).toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: '저장' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: '닫기' })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(screen.getByRole('button', { name: '저장' })).toHaveFocus();
  });

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

/** 두 창을 겹쳐 여는 상황 (예: 이름 바꾸기 시트 위로 진화 축하 창이 뜰 때) */
function Stacked() {
  const [first, setFirst] = useState(false);
  const [second, setSecond] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setFirst(true)}>
        첫 번째 열기
      </button>
      <button type="button" onClick={() => setSecond(true)}>
        두 번째 열기
      </button>
      <button type="button" onClick={() => setFirst(false)}>
        첫 번째 닫기
      </button>
      <BottomSheet open={first} title="첫 번째" onClose={() => setFirst(false)}>
        <p>첫 번째 내용</p>
      </BottomSheet>
      <BottomSheet open={second} title="두 번째" onClose={() => setSecond(false)}>
        <p>두 번째 내용</p>
      </BottomSheet>
    </>
  );
}

describe('BottomSheet (겹쳐 열렸을 때)', () => {
  it('ESC는 맨 위 창만 닫고, 마지막 창이 닫혀야 스크롤 잠금이 풀린다', async () => {
    render(<Stacked />);
    await userEvent.click(screen.getByRole('button', { name: '첫 번째 열기' }));
    await userEvent.click(screen.getByRole('button', { name: '두 번째 열기' }));

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: '두 번째' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: '첫 번째' })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');

    await userEvent.keyboard('{Escape}');
    expect(document.body.style.overflow).toBe('');
  });

  it('아래 창이 먼저 닫혀도 마지막 창이 닫히면 스크롤 잠금이 풀린다', async () => {
    render(<Stacked />);
    await userEvent.click(screen.getByRole('button', { name: '첫 번째 열기' }));
    await userEvent.click(screen.getByRole('button', { name: '두 번째 열기' }));
    await userEvent.click(screen.getByRole('button', { name: '첫 번째 닫기' }));
    expect(document.body.style.overflow).toBe('hidden');

    await userEvent.keyboard('{Escape}');
    expect(document.body.style.overflow).toBe('');
  });
});
