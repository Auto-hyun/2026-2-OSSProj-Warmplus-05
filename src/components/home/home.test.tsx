import { render, screen } from '@testing-library/react';
import { GrowthLine } from './GrowthLine';
import { QuestionBubble } from './QuestionBubble';
import { TodayMissionShortcut } from './TodayMissionShortcut';
import { getMission } from '@/data/missions';

const walk = getMission('walk-10')!;

describe('GrowthLine', () => {
  it('다음 단계까지 남은 미션 수를 알려주고 미션 탭으로 이어진다', () => {
    render(<GrowthLine count={5} />);
    expect(screen.getByText('다음 성장까지 미션 2개')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/mission');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  });

  it('다 자라면 완성 문구를 보여준다', () => {
    render(<GrowthLine count={30} />);
    expect(screen.getByText('오목이가 다 자랐어요!')).toBeInTheDocument();
  });

  it('완성 문구에 지은 이름을 쓴다', () => {
    render(<GrowthLine count={30} name="별" />);
    expect(screen.getByText('별이 다 자랐어요!')).toBeInTheDocument();
  });
});

describe('TodayMissionShortcut', () => {
  it('아직 안 했으면 "하러 가기"', () => {
    render(<TodayMissionShortcut mission={walk} done={false} />);
    expect(screen.getByText(walk.title)).toBeInTheDocument();
    expect(screen.getByText('하러 가기')).toBeInTheDocument();
  });

  it('했으면 "완료"', () => {
    render(<TodayMissionShortcut mission={walk} done />);
    expect(screen.getByText('완료')).toBeInTheDocument();
    expect(screen.queryByText('하러 가기')).not.toBeInTheDocument();
  });
});

describe('QuestionBubble', () => {
  it('오늘의 질문을 보여준다', () => {
    render(<QuestionBubble question="오늘 마음 날씨는 어떤가요?" />);
    expect(screen.getByText('오늘의 질문')).toBeInTheDocument();
    expect(screen.getByText('오늘 마음 날씨는 어떤가요?')).toBeInTheDocument();
  });
});

describe('HomeScreen 대화 버튼', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-26T01:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  async function renderHome() {
    vi.resetModules();
    vi.doMock('next/navigation', () => ({ useRouter: () => ({ back: vi.fn(), push: vi.fn() }) }));
    const { HomeScreen } = await import('./HomeScreen');
    const { getBrowserStore } = await import('@/lib/storage/useOngi');
    return { HomeScreen, store: getBrowserStore() };
  }

  it('오늘 아직 이야기하지 않았으면 "내 생각 얘기하기"로 대화방에 간다', async () => {
    const { HomeScreen } = await renderHome();
    render(<HomeScreen />);
    expect(screen.getByRole('link', { name: '내 생각 얘기하기' })).toHaveAttribute('href', '/chat');
  });

  it('오늘 이미 이야기했으면 "이어서 이야기하기"', async () => {
    const { HomeScreen, store } = await renderHome();
    store.appendChatMessage('2026-09-26', '질문', { role: 'user', content: '안녕' });
    render(<HomeScreen />);
    expect(screen.getByRole('link', { name: '이어서 이야기하기' })).toBeInTheDocument();
  });
});
