import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

beforeEach(() => {
  localStorage.clear();
  Element.prototype.scrollIntoView = vi.fn();
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

afterEach(() => {
  vi.useRealTimers();
  // jsdom에 없는 편지 비행 애니메이션을 흉내 낸 것 정리
  Reflect.deleteProperty(Element.prototype, 'animate');
});

// 브라우저 스토어 싱글턴을 테스트마다 새로 만들기 위해 모듈을 다시 불러온다.
// 시작 화면은 카카오 로그인과 이름 짓기 다음이라, 그 둘을 마친 상태로 그린다 (이름을 안 주면 기본 이름 오목이)
async function renderIntro(name?: string) {
  vi.resetModules();
  const { IntroStory } = await import('./IntroStory');
  const { getBrowserStore } = await import('@/lib/storage/useOngi');
  const store = getBrowserStore();
  store.completeLogin();
  store.completeNaming(name);
  render(<IntroStory />);
  return store;
}

/** 질문 카드 하나 안의 선택지를 누른다 */
async function pick(questionName: RegExp, optionName: RegExp | string) {
  const card = screen.getByRole('region', { name: questionName });
  await userEvent.click(within(card).getByRole('button', { name: optionName }));
}

async function answerAll(heavy: boolean) {
  await pick(/질문 1/, heavy ? /바닥에 녹아내림/ : /흥얼흥얼/);
  await pick(/질문 2/, heavy ? /눈 뜨는 것부터 버겁다/ : /살짝 설렌다/);
  await pick(/질문 3/, heavy ? /^비$/ : /맑음/);
  await pick(/질문 4/, heavy ? /물어봐 줄 사람이 별로 없어/ : /나름 잘 지내/);
  await pick(/질문 5/, heavy ? '5칸 중 1칸' : '5칸 중 4칸');
  await pick(/질문 5/, '이만큼 남았어');
  await pick(/질문 6/, /외로움/);
}

describe('시작 화면 (먼저 도착한 편지)', () => {
  it('지은 이름으로: 편지 도착 → 인사 → 질문 하나씩 → 주제에 맞는 실제 온기레터 → 가방에 담기 → 앱으로', async () => {
    const store = await renderIntro('콩이');
    expect(screen.getByRole('heading', { name: /오늘 당신에게 도착한 게 있어요/ })).toBeInTheDocument();
    expect(screen.getByText('from. 콩이')).toBeInTheDocument();
    expect(screen.getByText('안녕, 나는 콩이야.', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('콩이가 물어온 첫 번째 질문')).toBeInTheDocument();

    // 처음엔 첫 질문만, 답하면 다음 질문이 열린다
    expect(screen.queryByRole('region', { name: /질문 2/ })).not.toBeInTheDocument();
    await pick(/질문 1/, /흥얼흥얼/);
    expect(screen.getByText('흥얼거리는 저녁이라니, 좋다!')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /질문 2/ })).toBeInTheDocument();

    await pick(/질문 2/, /살짝 설렌다/);
    await pick(/질문 3/, /맑음/);
    await pick(/질문 4/, /나름 잘 지내/);
    await pick(/질문 5/, '5칸 중 4칸');
    await pick(/질문 5/, '이만큼 남았어');
    await pick(/질문 6/, /외로움/);

    // 외로움 → 실제 온기레터 "혼자가 아닌데도 자주 외로움을 느껴요"
    const letter = screen.getByRole('region', { name: '먼저 도착한 편지' });
    expect(
      within(letter).getByRole('heading', {
        name: /혼자가 아닌데도 자주 외로움을 느껴요/,
      }),
    ).toBeInTheDocument();
    expect(within(letter).getByText(/저마다의 고독과 함께 걷고/)).toBeInTheDocument();
    expect(within(letter).getByRole('link', { name: /편지 전체 읽기/ })).toHaveAttribute('href', '/letters/3475151');
    expect(within(letter).queryByText('109')).not.toBeInTheDocument();
    expect(within(letter).getByText(/이 편지, 콩이 가방에/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '가방에 담아두기' }));
    expect(store.getState().savedLetters).toEqual([3475151]);
    expect(screen.getByRole('status')).toHaveTextContent('📮 첫 번째 편지를 콩이 가방에 담았어요.');
    expect(await screen.findByRole('heading', { name: /이제 매일 콩이와 만나요/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '콩이와 시작하기' }));
    expect(store.getState().profile).toMatchObject({ introSeen: true, named: true, birdName: '콩이' });
  });

  it('마음이 많이 무거운 답이면 편지와 함께 24시간 도움 기관을 안내한다', async () => {
    await renderIntro();
    await answerAll(true);
    const letter = screen.getByRole('region', { name: '먼저 도착한 편지' });
    expect(within(letter).getByText('오늘 많이 지쳐 보여서, 제일 따뜻한 편지로 골라왔어.')).toBeInTheDocument();
    expect(within(letter).getByRole('link', { name: /109/ })).toHaveAttribute('href', 'tel:109');
  });

  it('기록이 저장되지 않는 브라우저면 시작 화면 상단에 미리 알려준다 (가방에 담은 편지와 이름이 사라지니까)', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    });
    await renderIntro();
    expect(within(screen.getByRole('banner')).getByText(/이 브라우저에서는 기록이 저장되지 않아요/)).toBeInTheDocument();
    setItem.mockRestore();
  });

  it('지은 이름의 받침에 맞춰 부른다 (별 → 별이야 · 별이 · 별은 · 별과)', async () => {
    await renderIntro('별');
    expect(screen.getByText('안녕, 나는 별이야.', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('별이 물어온 첫 번째 질문')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /제일 닮은 별은\?/ })).toBeInTheDocument();
    await answerAll(false);
    await userEvent.click(screen.getByRole('button', { name: '가방에 담아두기' }));
    expect(await screen.findByRole('button', { name: '별과 시작하기' })).toBeInTheDocument();
    // 이름 자리 표시가 화면에 그대로 남지 않는다
    expect(document.body.textContent).not.toMatch(/\{name/);
  });

  it('빨리 연달아 답하면 마지막 답의 다음 질문으로만 내려간다 (먼저 예약된 이동이 지나온 질문으로 끌어올리지 않게)', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await renderIntro();
    const option = (question: RegExp, name: RegExp) => within(screen.getByRole('region', { name: question })).getByRole('button', { name });
    fireEvent.click(option(/질문 1/, /흥얼흥얼/));
    fireEvent.click(option(/질문 2/, /살짝 설렌다/));
    act(() => vi.advanceTimersByTime(2000));
    const scrolledTo = vi.mocked(Element.prototype.scrollIntoView).mock.contexts;
    expect(scrolledTo).toHaveLength(1);
    expect(scrolledTo[0]).toBe(screen.getByRole('region', { name: /질문 3/ }));
  });

  it('편지가 가방으로 날아가는 동안 버튼을 또 눌러도 한 번만 날아간다', async () => {
    // 끝나지 않는 비행으로 "날아가는 중"을 만든다
    const animate = vi.fn(() => ({ finished: new Promise(() => {}) }));
    Element.prototype.animate = animate as unknown as Element['animate'];
    await renderIntro();
    await answerAll(false);
    const button = screen.getByRole('button', { name: '가방에 담아두기' });
    await userEvent.click(button);
    await userEvent.click(button);
    expect(animate).toHaveBeenCalledTimes(1);
  });

  it('편지를 담은 뒤 고민 주제를 바꾸면, 새로 온 편지는 아직 담기 전으로 보인다', async () => {
    const store = await renderIntro();
    await answerAll(false);
    await userEvent.click(screen.getByRole('button', { name: '가방에 담아두기' }));
    await pick(/질문 6/, /가족/);
    const letter = screen.getByRole('region', { name: '먼저 도착한 편지' });
    expect(within(letter).getByRole('button', { name: '가방에 담아두기' })).toBeEnabled();
    expect(store.getState().savedLetters).toEqual([3475151]);
  });

  it('질문이 하나씩 열려 문서가 길어져도 위쪽 진행 막대가 뒤로 가지 않는다', async () => {
    // jsdom엔 레이아웃이 없어 직접 정한다: 첫 질문이 화면에 온 위치 (문서 7000px, 화면 844px)
    const doc = document.documentElement;
    let docHeight = 7000;
    Object.defineProperty(doc, 'scrollHeight', { configurable: true, get: () => docHeight });
    const initial = { innerHeight: window.innerHeight, scrollY: window.scrollY };
    Object.assign(window, { innerHeight: 844, scrollY: 6077 });
    try {
      await renderIntro();
      const bar = document.querySelector<HTMLElement>('[class*="scrollbar"] > span')!;
      const barAfterScroll = async () => {
        fireEvent.scroll(window);
        await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
        return parseFloat(/scaleX\(([^)]+)\)/.exec(bar.style.transform)![1]);
      };
      const atFirstQuestion = await barAfterScroll();
      await pick(/질문 1/, /흥얼흥얼/);
      docHeight += 844; // 질문 2가 열려 한 화면 길어짐
      const afterOpening = await barAfterScroll();
      // 질문 여섯 개와 편지가 아직 남았는데 거의 다 찬 것처럼 보이지 않게
      expect(atFirstQuestion).toBeLessThan(0.5);
      expect(afterOpening).toBeGreaterThanOrEqual(atFirstQuestion);
    } finally {
      Reflect.deleteProperty(doc, 'scrollHeight');
      Object.assign(window, initial);
    }
  });
});
