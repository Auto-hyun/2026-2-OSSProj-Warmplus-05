import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TESTS, getTest } from '@/data/tests';

const nav = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => nav }));

beforeEach(() => {
  localStorage.clear();
  nav.replace.mockClear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-27T01:00:00Z'));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

// 브라우저 스토어 싱글턴을 테스트마다 새로 만들기 위해 모듈을 다시 불러온다
async function fresh() {
  vi.resetModules();
  const { getBrowserStore } = await import('@/lib/storage/useOngi');
  return getBrowserStore();
}

describe('테스트 목록', () => {
  it('테스트 3개를 문항 수·소요 시간과 함께 보여주고, 해본 테스트엔 내 결과를 붙인다', async () => {
    const store = await fresh();
    store.saveTestResult('weather', 'cloudy');
    const { TestsScreen } = await import('./TestsScreen');
    render(<TestsScreen />);

    for (const t of TESTS) {
      expect(screen.getByRole('link', { name: new RegExp(t.title) })).toHaveAttribute('href', `/tests/${t.id}`);
    }
    expect(screen.getByText(`${getTest('coping')!.questions.length}문항 · 약 2분`)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /내 결과 구름 조금/ })).toHaveAttribute('href', '/tests/weather/result/cloudy');
  });
});

describe('테스트 진행', () => {
  it('시작하면 문항을 한 장씩 보여주고, 끝까지 답하면 결과를 저장한 뒤 결과 화면으로 간다', async () => {
    const store = await fresh();
    const { TestRunner } = await import('./TestRunner');
    render(<TestRunner testId="weather" />);

    await userEvent.click(screen.getByRole('button', { name: '시작하기' }));
    expect(screen.getByText('1 / 5')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '나는 즐겁고 기분이 좋았어요' })).toHaveFocus();

    for (let i = 0; i < 5; i++) await userEvent.click(screen.getByRole('button', { name: '늘 그랬어요' }));

    expect(store.getState().tests.weather).toEqual({ resultId: 'sunny', at: '2026-09-27T01:00:00.000Z' });
    expect(nav.replace).toHaveBeenCalledWith('/tests/weather/result/sunny');
  });

  it('이전으로 돌아가 답을 바꿀 수 있다', async () => {
    await fresh();
    const { TestRunner } = await import('./TestRunner');
    render(<TestRunner testId="weather" />);
    await userEvent.click(screen.getByRole('button', { name: '시작하기' }));
    await userEvent.click(screen.getByRole('button', { name: '늘 그랬어요' }));
    expect(screen.getByText('2 / 5')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '이전 문항' }));
    expect(screen.getByText('1 / 5')).toBeInTheDocument();
  });
});

describe('테스트 결과', () => {
  it('결과 이름·설명·이럴 땐 이렇게·돌아보기 질문과 출처를 보여주고, 진단이 아니라고 알린다', async () => {
    await fresh();
    const { TestResultView } = await import('./TestResultView');
    render(<TestResultView testId="coping" resultId="sharer" />);
    expect(screen.getByRole('heading', { name: /마음 나눔형/ })).toBeInTheDocument();
    expect(screen.getByText('마음을 나눌 사람을 한두 명 떠올려 두기')).toBeInTheDocument();
    expect(screen.getByText('요즘 가장 이야기하고 싶은 사람은 누구인가요?')).toBeInTheDocument();
    expect(screen.getByText(/진단이 아니라/)).toBeInTheDocument();
    expect(screen.getByText(/Carver/)).toBeInTheDocument();
    // 처음 온 사람(공유 링크)에게는 나도 해보기
    expect(screen.getByRole('link', { name: '나도 해보기' })).toHaveAttribute('href', '/tests/coping');
  });

  it('마음이 많이 힘든 결과에는 도움받을 수 있는 곳을 함께 보여준다', async () => {
    await fresh();
    const { TestResultView } = await import('./TestResultView');
    render(<TestResultView testId="weather" resultId="rainy" />);
    expect(screen.getByRole('region', { name: '도움받을 수 있는 곳' })).toBeInTheDocument();
  });

  it('내가 받은 결과면 "나의 결과"와 날짜를, 공유 링크로 본 다른 결과면 "나도 해보기"를 보여준다', async () => {
    const store = await fresh();
    store.saveTestResult('coping', 'sharer');
    const { TestResultView } = await import('./TestResultView');
    const { unmount } = render(<TestResultView testId="coping" resultId="sharer" />);
    expect(screen.getByText('나의 결과 · 9월 27일')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '다시 하기' })).toHaveAttribute('href', '/tests/coping');
    unmount();

    render(<TestResultView testId="coping" resultId="solver" />);
    expect(screen.queryByText(/나의 결과 ·/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '나도 해보기' })).toHaveAttribute('href', '/tests/coping');
  });

  it('공유 기능이 없는 브라우저에서는 결과 링크를 복사한다', async () => {
    await fresh();
    const writeText = vi.fn(async () => {});
    vi.stubGlobal('navigator', { ...navigator, share: undefined, clipboard: { writeText } });
    const { TestResultView } = await import('./TestResultView');
    render(<TestResultView testId="weather" resultId="sunny" />);
    await userEvent.click(screen.getByRole('button', { name: '결과 공유하기' }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('/tests/weather/result/sunny'));
    expect(screen.getByRole('status')).toHaveTextContent('링크를 복사했어요');
  });
});

describe('나의 온기 — 나의 테스트 결과', () => {
  it('해본 테스트는 결과로, 안 해본 테스트는 테스트로 이어진다', async () => {
    const store = await fresh();
    store.saveTestResult('self-esteem', 'cozy');
    const { TestRecordList } = await import('@/components/me/TestRecordList');
    render(<TestRecordList records={store.getState().tests} />);
    const esteem = screen.getByRole('link', { name: /나의 자존감 온도/ });
    expect(esteem).toHaveAttribute('href', '/tests/self-esteem/result/cozy');
    expect(within(esteem).getByText(/포근/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /지금 내 마음 날씨/ })).toHaveAttribute('href', '/tests/weather');
  });
});
