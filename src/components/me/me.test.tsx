import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatRecordList } from './ChatRecordList';
import { GrowthAlbum } from './GrowthAlbum';
import { ProfileCard } from './ProfileCard';
import { SettingsSection } from './SettingsSection';
import { StatsTiles } from './StatsTiles';
import type { ChatDay } from '@/lib/storage/types';

vi.mock('next/navigation', () => ({ useRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }) }));

describe('GrowthAlbum', () => {
  it('도달한 단계는 모습을, 아직인 단계는 필요한 미션 수를 보여준다', () => {
    render(<GrowthAlbum reached={2} />);
    expect(screen.getByRole('img', { name: '알' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '아기새' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: '편지 오목이' })).not.toBeInTheDocument();
    expect(screen.getByText('미션 7개')).toBeInTheDocument();
    expect(screen.getByText('미션 30개')).toBeInTheDocument();
  });
});

describe('ChatRecordList', () => {
  const day = (question: string, userText?: string): ChatDay => ({
    question,
    bridgeShown: false,
    messages: userText
      ? [
          { role: 'user', content: userText, at: '' },
          { role: 'assistant', content: '답장', at: '' },
        ]
      : [{ role: 'assistant', content: '답장만', at: '' }],
  });

  it('얘기한 날만 최신순으로, 첫 이야기와 함께 보여준다', () => {
    render(
      <ChatRecordList
        today="2026-09-26"
        chats={{
          '2026-09-20': day('질문 A', '첫 이야기 A'),
          '2026-09-24': day('질문 B', '첫 이야기 B'),
          '2026-09-22': day('질문 C'),
        }}
      />,
    );
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/chat?date=2026-09-24');
    expect(within(links[0]).getByText('첫 이야기 B')).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/chat?date=2026-09-20');
  });

  it('기록이 없으면 안내 문구', () => {
    render(<ChatRecordList today="2026-09-26" chats={{}} />);
    expect(screen.getByText('아직 나눈 이야기가 없어요.')).toBeInTheDocument();
  });
});

describe('StatsTiles', () => {
  it('누적 미션·이번 달 미션·얘기한 날을 보여준다', () => {
    render(<StatsTiles total={8} thisMonth={3} talkedDays={5} />);
    expect(screen.getByText('얘기한 날').nextElementSibling).toHaveTextContent('5일');
  });
});

describe('SettingsSection', () => {
  it('버전을 누를 때마다 알린다', async () => {
    const onVersionTap = vi.fn();
    render(<SettingsSection version="0.1.0" onReset={() => {}} onVersionTap={onVersionTap} />);
    const version = screen.getByRole('button', { name: /v0\.1\.0/ });
    for (let i = 0; i < 5; i++) await userEvent.click(version);
    expect(onVersionTap).toHaveBeenCalledTimes(5);
  });

  it('기록 지우기는 한 번 더 확인한 뒤에만 실행한다', async () => {
    const onReset = vi.fn();
    render(<SettingsSection version="0.1.0" onReset={onReset} onVersionTap={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: '기록 모두 지우기' }));
    expect(onReset).not.toHaveBeenCalled();
    await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: '모두 지우기' }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});

describe('ProfileCard', () => {
  it('이름 입력칸 글자는 16px 이상이라 iOS 사파리에서 확대되지 않는다', async () => {
    render(<ProfileCard birdName="뱁새" stage={3} count={8} daysTogether={12} onRename={() => ({ ok: true })} />);
    await userEvent.click(screen.getByRole('button', { name: '이름 바꾸기' }));
    expect(screen.getByRole('textbox', { name: '새 이름' }).className).toContain('text-base');
  });

  it('이름을 바꾸고, 규칙에 맞지 않으면 안내한다', async () => {
    const onRename = vi.fn((name: string) => ({ ok: name.trim().length > 0 }));
    render(<ProfileCard birdName="뱁새" stage={3} count={8} daysTogether={12} onRename={onRename} />);
    expect(screen.getByText('함께한 지 12일째')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '이름 바꾸기' }));
    const input = screen.getByRole('textbox', { name: '새 이름' });
    await userEvent.clear(input);
    await userEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(screen.getByText('1~10자로 지어주세요')).toBeInTheDocument();

    await userEvent.type(input, '콩이');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(onRename).toHaveBeenLastCalledWith('콩이');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('MeScreen (시연 모드 진입)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-26T01:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('버전을 빠르게 5번 누르면 시연 모드가 켜진다', async () => {
    vi.resetModules();
    const { MeScreen } = await import('./MeScreen');
    const { getBrowserStore } = await import('@/lib/storage/useOngi');
    render(<MeScreen />);
    const version = screen.getByRole('button', { name: /v0\.1\.0/ });
    for (let i = 0; i < 5; i++) await userEvent.click(version);
    expect(getBrowserStore().getState().settings.demoMode).toBe(true);
    expect(screen.getByRole('status')).toHaveTextContent('시연 모드를 켰어요');
  });
});
