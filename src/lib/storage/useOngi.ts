'use client';

import { useSyncExternalStore } from 'react';
import { addDays, msUntilNextKstMidnight, todayKey, type DayKey } from '@/lib/date';
import { createLocalStorageAdapter, createMemoryAdapter } from './adapters';
import { createStore, type OngiStore } from './store';
import type { OngiState } from './types';

let browserStore: OngiStore | null = null;
let browserPersistent = false;

/**
 * 브라우저 스토어(싱글턴). localStorage를 못 쓰면 메모리에만 둔다.
 * 서버 렌더 중에는 매번 버리는 메모리 스토어를 준다(요청 간 상태 공유 방지).
 */
export function getBrowserStore(): OngiStore {
  if (typeof window === 'undefined') return createStore(createMemoryAdapter());
  if (!browserStore) {
    const local = createLocalStorageAdapter();
    browserPersistent = local !== null;
    browserStore = createStore(local ?? createMemoryAdapter());
  }
  return browserStore;
}

const noopSubscribe = () => () => {};
const serverSnapshot = () => undefined;

/** 상태에서 값을 골라 구독한다. 서버 렌더·하이드레이션 전에는 undefined */
export function useOngi<T>(selector: (s: OngiState) => T): T | undefined {
  const store = typeof window === 'undefined' ? null : getBrowserStore();
  const state = useSyncExternalStore(
    store ? store.subscribe : noopSubscribe,
    store ? store.getState : serverSnapshot,
    serverSnapshot,
  );
  return state === undefined ? undefined : selector(state);
}

/** 상태를 바꾸는 액션 모음 (이벤트 핸들러에서 사용) */
export function useStore(): OngiStore {
  return getBrowserStore();
}

/**
 * 날짜 변화 구독: 한국 자정이 되면, 또는 잠들었던 화면으로 돌아오면(visibilitychange·focus·pageshow)
 * 오늘 날짜를 다시 확인한다. 화면을 켜둔 채 자정을 넘겨도 "오늘"이 어제에 머물지 않게.
 */
function subscribeDay(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const schedule = () => {
    timer = setTimeout(() => {
      onChange();
      schedule();
    }, msUntilNextKstMidnight(new Date()) + 500);
  };
  schedule();
  window.addEventListener('focus', onChange);
  window.addEventListener('pageshow', onChange);
  document.addEventListener('visibilitychange', onChange);
  return () => {
    clearTimeout(timer);
    window.removeEventListener('focus', onChange);
    window.removeEventListener('pageshow', onChange);
    document.removeEventListener('visibilitychange', onChange);
  };
}

const getDaySnapshot = () => todayKey(new Date());

/** 한국 날짜 기준 오늘 (시연 날짜 이동 포함). 하이드레이션 전에는 undefined */
export function useToday(): DayKey | undefined {
  const offset = useOngi((s) => s.settings.dayOffset);
  const base = useSyncExternalStore(subscribeDay, getDaySnapshot, serverSnapshot);
  if (offset === undefined || base === undefined) return undefined;
  return offset === 0 ? base : addDays(base, offset);
}

/** 기록이 기기에 저장되는지. 하이드레이션 전에는 undefined */
export function useIsPersistent(): boolean | undefined {
  const ready = useOngi(() => true);
  return ready === undefined ? undefined : browserPersistent;
}
