'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/Toast';
import { accountOf, finishKakaoLogin, signOutHere, startKakaoLogin, type Account, type KakaoReturn } from '@/lib/supabase/kakao';
import { useSupabase } from '@/lib/supabase/useSupabase';

const NOTICES: Partial<Record<KakaoReturn, { message: string; tone: 'info' | 'error' }>> = {
  canceled: { message: '카카오 로그인을 취소했어요.', tone: 'info' },
  failed: { message: '카카오 로그인을 하지 못했어요. 잠시 뒤에 다시 해 주세요.', tone: 'error' },
};

/** 카카오에서 돌아올 곳 (Supabase Redirect URLs에 이 주소가 들어 있어야 한다) */
function backHere() {
  return `${window.location.origin}/me`;
}

/** 계정 카드: 카카오로 로그인하면 다른 기기에서도 내가 쓴 글을 보고 지울 수 있다. Supabase가 없으면 숨긴다 */
export function AccountCard() {
  const supabase = useSupabase();
  const [account, setAccount] = useState<Account | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    // 알림은 한 번만 온다 (finishKakaoLogin이 페이지마다 한 번만 결과를 준다)
    finishKakaoLogin(supabase).then((result) => {
      const notice = NOTICES[result];
      if (notice) toast(notice.message, { tone: notice.tone });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (active) setAccount(accountOf(data.session?.user));
    });
    return () => {
      active = false;
    };
  }, [supabase]);

  if (supabase === null) return null;
  if (supabase === undefined || account === null) return <div className="h-[92px] rounded-[18px] bg-surface/60" />;

  async function login() {
    if (!supabase) return;
    setBusy(true);
    try {
      await startKakaoLogin(supabase, backHere()); // 성공하면 카카오 화면으로 넘어간다
    } catch (error) {
      console.error('[kakao] 로그인을 시작하지 못함', error);
      toast('지금은 카카오 로그인을 할 수 없어요. 잠시 뒤에 다시 해 주세요.', { tone: 'error' });
      setBusy(false);
    }
  }

  async function logout() {
    if (!supabase) return;
    setBusy(true);
    try {
      await signOutHere(supabase);
      window.location.reload(); // 내가 쓴 글처럼 계정에 딸린 목록을 새로 불러온다
    } catch {
      toast('로그아웃하지 못했어요.', { tone: 'error' });
      setBusy(false);
    }
  }

  if (account.kind === 'kakao') {
    return (
      <section aria-label="계정" className="flex items-center gap-3 rounded-[18px] border border-cream-line bg-surface px-4 py-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#FEE500] text-black/85">
          <KakaoSymbol />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-cocoa-900">{account.nickname ?? '카카오 계정'}</p>
          <p className="text-sm text-taupe-500">카카오로 로그인했어요</p>
        </div>
        <button
          type="button"
          onClick={logout}
          disabled={busy}
          className="h-9 shrink-0 rounded-full border border-cream-line bg-bg px-3.5 text-sm font-semibold text-taupe-500 active:bg-black/5 disabled:opacity-60"
        >
          로그아웃
        </button>
      </section>
    );
  }

  return (
    <section aria-label="계정" className="rounded-[18px] border border-cream-line bg-surface px-4 py-3">
      <p className="text-sm text-taupe-500">카카오로 로그인하면 다른 기기에서도 내가 쓴 글을 보고 지울 수 있어요.</p>
      {account.anonymous && (
        <p className="mt-1 text-sm text-taupe-500">로그인 전에 이 기기에서 쓴 글은 카카오 계정으로 옮겨지지 않아요.</p>
      )}
      {/* 카카오 로그인 버튼 가이드: 노란 바탕(#FEE500), 검은 말풍선, "카카오 로그인" */}
      <button
        type="button"
        onClick={login}
        disabled={busy}
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-[15px] font-semibold text-black/85 active:brightness-95 disabled:opacity-60"
      >
        <KakaoSymbol />
        카카오 로그인
      </button>
    </section>
  );
}

function KakaoSymbol() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden>
      <path
        fill="currentColor"
        d="M12 3C6.48 3 2 6.54 2 10.9c0 2.82 1.87 5.29 4.68 6.69l-.95 3.47c-.08.3.26.54.52.37l4.15-2.75c.52.07 1.05.11 1.6.11 5.52 0 10-3.54 10-7.89S17.52 3 12 3z"
      />
    </svg>
  );
}
