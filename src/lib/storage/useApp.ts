'use client';

import { useSyncExternalStore } from 'react';
import { createLocalStorageAdapter, createMemoryAdapter } from './adapters';
import { createStore, type AppStore } from './store';
import type { AppState } from './types';

let browserStore: AppStore | null = null;

/**
 * 브라우저 스토어(싱글턴). localStorage를 못 쓰면 메모리에만 둔다.
 * 서버 렌더 중에는 매번 버리는 메모리 스토어를 준다(요청 간 상태 공유 방지).
 */
export function getBrowserStore(): AppStore {
  if (typeof window === 'undefined') return createStore(createMemoryAdapter());
  browserStore ??= createStore(createLocalStorageAdapter() ?? createMemoryAdapter());
  return browserStore;
}

const noopSubscribe = () => () => {};
const serverSnapshot = () => undefined;

/** 상태에서 값을 골라 구독한다. 서버 렌더·하이드레이션 전에는 undefined */
export function useApp<T>(selector: (s: AppState) => T): T | undefined {
  const store = typeof window === 'undefined' ? null : getBrowserStore();
  const state = useSyncExternalStore(store ? store.subscribe : noopSubscribe, store ? store.getState : serverSnapshot, serverSnapshot);
  return state === undefined ? undefined : selector(state);
}

/** 상태를 바꾸는 액션 모음 (이벤트 핸들러에서 사용) */
export function useStore(): AppStore {
  return getBrowserStore();
}
