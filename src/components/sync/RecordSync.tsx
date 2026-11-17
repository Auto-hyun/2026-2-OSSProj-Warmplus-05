'use client';

import { useEffect } from 'react';
import { track } from '@/lib/events';
import { forgetSyncedRecords, memberIdOf, startRecordSync, type RecordSync as Sync } from '@/lib/recordSync';
import { getBrowserStore } from '@/lib/storage/useApp';
import { getSupabase } from '@/lib/supabase/browser';

/**
 * 카카오로 로그인해 있으면 기기 기록(마음 기록·테스트 결과·저장한 노래·닉네임·생일)을 계정과 맞춘다.
 * 로그아웃되면 이 기기의 계정 기록을 지운다. 익명 계정(글쓰기용)은 맞추지 않는다 (docs/data.md)
 */
export function RecordSync() {
  useEffect(() => {
    const supabase = getSupabase();
    let storage: Storage;
    try {
      storage = window.localStorage;
    } catch {
      return; // 저장소가 막힌 브라우저: 기기 기록도 남지 않으니 맞출 것이 없다
    }
    if (!supabase) return;
    const store = getBrowserStore();
    let sync: Sync | null = null;
    let current: string | null = null;
    let disposed = false;

    async function follow(memberId: string | null) {
      if (memberId === current) return;
      sync?.stop();
      sync = null;
      current = memberId;
      if (!memberId) return;
      try {
        const started = await startRecordSync(supabase!, store, memberId, storage);
        if (disposed || current !== memberId) {
          started.stop();
          return;
        }
        sync = started;
        if (started.firstHere) track('login', { provider: 'kakao' });
      } catch (error) {
        console.error('[sync] 계정 기록을 맞추지 못했어요', error);
        current = null; // 다음 로그인 알림(토큰 갱신 등) 때 다시 해 본다
      }
    }

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // 인증 알림 안에서 다른 Supabase 호출을 기다리면 멈출 수 있어 다음 차례로 미룬다
      setTimeout(() => {
        if (disposed) return;
        if (event === 'SIGNED_OUT') forgetSyncedRecords(store, storage);
        void follow(memberIdOf(session?.user));
      }, 0);
    });

    return () => {
      disposed = true;
      data.subscription.unsubscribe();
      sync?.stop();
    };
  }, []);

  return null;
}
