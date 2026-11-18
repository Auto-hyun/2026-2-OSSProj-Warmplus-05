'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/Toast';
import { deleteMyRecords, forgetSyncedRecords, saveBeforeSignOut } from '@/lib/recordSync';
import { getBrowserStore } from '@/lib/storage/useApp';
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

/**
 * 계정 카드: 카카오로 로그인하면 마음 기록·테스트 결과·저장한 노래가 계정에 저장되고(RecordSync),
 * 다른 기기에서도 내가 쓴 글을 보고 지울 수 있다. Supabase가 없으면 숨긴다
 */
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
    if (!window.confirm('로그아웃하면 이 기기에 있던 마음 기록·테스트 결과·저장한 노래가 지워져요. 계정에는 남아 있어 다시 로그인하면 돌아와요.')) return;
    setBusy(true);
    try {
      const store = getBrowserStore();
      // 못 올린 기록을 먼저 올려 본다. 그래도 남아 있으면 사라진다고 한 번 더 묻는다
      const saved = await saveBeforeSignOut(store, window.localStorage);
      const sure =
        saved ||
        window.confirm('아직 계정에 올리지 못한 기록이 있어요. 지금 로그아웃하면 그 기록은 사라져요. 그래도 로그아웃할까요? (인터넷에 연결된 뒤 다시 하면 함께 올라가요)');
      if (!sure) {
        setBusy(false);
        return;
      }
      await signOutHere(supabase);
      forgetSyncedRecords(store, window.localStorage, { force: true });
      window.location.reload(); // 내가 쓴 글처럼 계정에 딸린 목록을 새로 불러온다
    } catch {
      toast('로그아웃하지 못했어요.', { tone: 'error' });
      setBusy(false);
    }
  }

  async function deleteMine() {
    if (!supabase) return;
    const ok = window.confirm(
      '계정과 이 기기에 저장된 마음 기록, 테스트 결과, 저장한 노래, 닉네임·생일을 모두 지울까요? 되돌릴 수 없어요. (오목이 대화와 내가 쓴 글은 그대로예요)',
    );
    if (!ok) return;
    setBusy(true);
    try {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;
      if (!userId) throw new Error('로그인이 풀렸어요.');
      await deleteMyRecords(supabase, getBrowserStore(), userId, window.localStorage);
      toast('기록을 모두 지웠어요.');
    } catch {
      toast('기록을 지우지 못했어요. 잠시 뒤에 다시 해 주세요.', { tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  if (account.kind === 'kakao') {
    return (
      <section aria-label="계정" className="rounded-[18px] border border-cream-line bg-surface px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#FEE500] text-black/85">
            <KakaoSymbol />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold text-cocoa-900">{account.nickname ?? '카카오 계정'}</p>
            <p className="text-sm text-taupe-500">기록이 계정에 저장되고 있어요</p>
          </div>
          <button
            type="button"
            onClick={logout}
            disabled={busy}
            className="h-9 shrink-0 rounded-full border border-cream-line bg-bg px-3.5 text-sm font-semibold text-taupe-500 active:bg-black/5 disabled:opacity-60"
          >
            로그아웃
          </button>
        </div>
        <div className="mt-2.5 flex items-center justify-between border-t border-cream-line pt-2.5 text-[13px]">
          <Link href="/privacy" className="text-taupe-500 underline underline-offset-2">
            개인정보 처리방침
          </Link>
          <button type="button" onClick={deleteMine} disabled={busy} className="font-semibold text-danger disabled:opacity-60">
            내 기록 지우기
          </button>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="계정" className="rounded-[18px] border border-cream-line bg-surface px-4 py-3">
      <p className="text-sm text-taupe-500">
        카카오로 로그인하면 마음 기록·테스트 결과·저장한 노래가 계정에 저장돼 기기를 바꿔도 이어지고, 내가 쓴 글도 다른 기기에서 보고 지울 수 있어요.
      </p>
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
      <p className="mt-2 text-center text-xs text-taupe-500">
        로그인하면{' '}
        <Link href="/privacy" className="underline underline-offset-2">
          개인정보 처리방침
        </Link>
        에 따라 기록을 저장해요.
      </p>
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
