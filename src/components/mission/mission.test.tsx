import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompleteSheet } from './CompleteSheet';
import { MissionCalendar } from './MissionCalendar';
import { TodayMissionCard } from './TodayMissionCard';
import { getMission } from '@/data/missions';

vi.mock('next/navigation', () => ({ useRouter: () => ({ back: vi.fn(), push: vi.fn() }) }));

const walk = getMission('walk-10')!;
const record = { missionId: 'walk-10', completedAt: '2026-09-03T01:00:00.000Z' };

describe('TodayMissionCard', () => {
  it('"완료했어요"를 누르면 완료를 요청한다', async () => {
    const onComplete = vi.fn();
    render(<TodayMissionCard mission={walk} done={false} canSwap onComplete={onComplete} onSwap={() => {}} />);
    expect(screen.getByText(walk.title)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '완료했어요' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('교체할 수 있을 때만 "다른 미션" 버튼이 있다', async () => {
    const onSwap = vi.fn();
    const { rerender } = render(<TodayMissionCard mission={walk} done={false} canSwap onComplete={() => {}} onSwap={onSwap} />);
    await userEvent.click(screen.getByRole('button', { name: /다른 미션/ }));
    expect(onSwap).toHaveBeenCalledTimes(1);
    rerender(<TodayMissionCard mission={walk} done={false} canSwap={false} onComplete={() => {}} onSwap={onSwap} />);
    expect(screen.queryByRole('button', { name: /다른 미션/ })).not.toBeInTheDocument();
  });

  it('완료했으면 완료 문구와 메모를 보여주고 버튼은 없다', () => {
    render(<TodayMissionCard mission={walk} done note="개운했어" canSwap={false} onComplete={() => {}} onSwap={() => {}} />);
    expect(screen.getByText('오늘 미션 완료!')).toBeInTheDocument();
    expect(screen.getByText(/개운했어/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '완료했어요' })).not.toBeInTheDocument();
  });
});

describe('CompleteSheet', () => {
  it('메모를 적고 완료하면 메모를 넘긴다 (100자 제한)', async () => {
    const onSubmit = vi.fn();
    render(<CompleteSheet open mission={walk} onClose={() => {}} onSubmit={onSubmit} />);
    const input = screen.getByRole('textbox', { name: '어땠나요? (선택)' });
    expect(input).toHaveAttribute('maxLength', '100');
    await userEvent.type(input, '햇살이 좋았어');
    await userEvent.click(screen.getByRole('button', { name: '완료' }));
    expect(onSubmit).toHaveBeenCalledWith('햇살이 좋았어');
  });
});

describe('MissionCalendar', () => {
  it('완료한 날에만 도장이 있고, 오늘을 표시한다', () => {
    render(
      <MissionCalendar
        year={2026}
        month={9}
        today="2026-09-26"
        records={{ '2026-09-03': record }}
        canGoNext={false}
        onPrev={() => {}}
        onNext={() => {}}
        onPickDay={() => {}}
      />,
    );
    expect(screen.getByRole('heading', { name: '2026년 9월' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '9월 3일, 미션 완료' })).toBeInTheDocument();
    expect(screen.getByLabelText('9월 4일')).toBeInTheDocument();
    expect(screen.getByLabelText('9월 26일, 오늘')).toHaveAttribute('aria-current', 'date');
    expect(screen.getByRole('button', { name: '다음 달' })).toBeDisabled();
  });

  it('완료한 날을 누르면 그 날짜를 알려준다', async () => {
    const onPickDay = vi.fn();
    render(
      <MissionCalendar
        year={2026}
        month={9}
        today="2026-09-26"
        records={{ '2026-09-03': record }}
        canGoNext={false}
        onPrev={() => {}}
        onNext={() => {}}
        onPickDay={onPickDay}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: '9월 3일, 미션 완료' }));
    expect(onPickDay).toHaveBeenCalledWith('2026-09-03');
  });
});

describe('MissionScreen (완료 흐름)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-26T01:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('완료했어요 → 시트에서 완료 → 기록되고 캘린더에 도장이 찍힌다', async () => {
    vi.resetModules();
    const { MissionScreen } = await import('./MissionScreen');
    const { getBrowserStore } = await import('@/lib/storage/useOngi');
    render(<MissionScreen />);

    await userEvent.click(screen.getByRole('button', { name: '완료했어요' }));
    await userEvent.type(screen.getByRole('textbox', { name: '어땠나요? (선택)' }), '좋았어');
    await userEvent.click(screen.getByRole('button', { name: '완료' }));

    expect(getBrowserStore().getState().missions.records['2026-09-26'].note).toBe('좋았어');
    expect(screen.getByText('오늘 미션 완료!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '9월 26일, 미션 완료, 오늘' })).toBeInTheDocument();
    expect(screen.getByText('이번 달 1일 · 누적 1개')).toBeInTheDocument();
  });
});
