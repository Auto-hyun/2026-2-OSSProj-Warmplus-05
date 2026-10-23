'use client';

import { useSyncExternalStore } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './browser';

const noopSubscribe = () => () => {};

/** 하이드레이션 전에는 undefined, 환경 변수가 없으면 null (서버 렌더와 첫 화면을 맞추기 위해) */
export function useSupabase(): SupabaseClient | null | undefined {
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  return hydrated ? getSupabase() : undefined;
}
