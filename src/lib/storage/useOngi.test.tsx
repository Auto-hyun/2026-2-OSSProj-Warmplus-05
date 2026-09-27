import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';

// 모듈 안의 브라우저 스토어 싱글턴을 테스트마다 새로 만들기 위해 매번 다시 불러온다
async function loadHooks() {
  vi.resetModules();
  return import('./useOngi');
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-25T15:30:00Z')); // 한국 2026-09-26 00:30
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useOngi', () => {
  it('클라이언트에서는 선택한 값을 준다', async () => {
    const { useOngi } = await loadHooks();
    const { result } = renderHook(() => useOngi((s) => s.profile.birdName));
    expect(result.current).toBe('오목이');
  });

  it('서버 렌더(빌드 시점)에는 값을 주지 않는다', async () => {
    const { useOngi } = await loadHooks();
    function Probe() {
      const name = useOngi((s) => s.profile.birdName);
      return <span>{name ?? '로딩'}</span>;
    }
    expect(renderToString(<Probe />)).toContain('로딩');
  });

  it('스토어가 바뀌면 다시 그린다', async () => {
    const { useOngi, useStore } = await loadHooks();
    const { result } = renderHook(() => ({ name: useOngi((s) => s.profile.birdName), store: useStore() }));
    act(() => {
      result.current.store.renameBird('콩이');
    });
    expect(result.current.name).toBe('콩이');
  });

  it('localStorage에 저장한다', async () => {
    const { useStore } = await loadHooks();
    const { result } = renderHook(() => useStore());
    act(() => {
      result.current.completeMission();
    });
    expect(localStorage.getItem('ongi:v1')).toContain('2026-09-26');
  });
});

describe('useToday / useIsPersistent', () => {
  it('한국 날짜 기준 오늘과 저장 가능 여부를 준다', async () => {
    const { useToday, useIsPersistent } = await loadHooks();
    const { result } = renderHook(() => ({ today: useToday(), persistent: useIsPersistent() }));
    expect(result.current.today).toBe('2026-09-26');
    expect(result.current.persistent).toBe(true);
  });
});

describe('useToday (화면을 켜둔 채 자정이 지날 때)', () => {
  afterEach(() => vi.useRealTimers());

  it('한국 자정이 지나면 저절로 새 날짜로 바뀐다', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(new Date('2026-09-26T14:59:00Z')); // 한국 9/26 23:59
    const { useToday } = await loadHooks();
    const { result } = renderHook(() => useToday());
    expect(result.current).toBe('2026-09-26');
    act(() => {
      vi.advanceTimersByTime(2 * 60_000);
    });
    expect(result.current).toBe('2026-09-27');
  });

  it('잠든 화면으로 돌아오면(visibilitychange) 날짜를 다시 확인한다', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-26T14:59:00Z'));
    const { useToday } = await loadHooks();
    const { result } = renderHook(() => useToday());
    expect(result.current).toBe('2026-09-26');
    vi.setSystemTime(new Date('2026-09-26T23:00:00Z')); // 한국 9/27 08:00 (타이머 없이 시간만 흐름)
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current).toBe('2026-09-27');
  });
});
