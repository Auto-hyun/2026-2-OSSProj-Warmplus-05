'use client';

import { Pose } from '@/components/intro/Pose';
import { useStore } from '@/lib/storage/useOngi';

/** 카카오 로그인 버튼의 말풍선 기호 (카카오 디자인 가이드: 노란 바탕 #FEE500, 검은 기호, 85% 검정 글자) */
function KakaoSymbol() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-5">
      <path
        fill="#000"
        d="M12 3.6c-5.3 0-9.6 3.33-9.6 7.44 0 2.63 1.76 4.94 4.4 6.26l-.9 3.32c-.08.3.26.53.52.36l3.96-2.62c.53.06 1.07.1 1.62.1 5.3 0 9.6-3.33 9.6-7.42S17.3 3.6 12 3.6z"
      />
    </svg>
  );
}

/** 처음 실행 첫 화면: 카카오 로그인. 지금은 화면만 있고, 버튼을 누르면 이름 짓기로 넘어간다 */
export function LoginScreen() {
  const store = useStore();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+24px)] text-center">
      <Pose pose="hello" eager className="w-36" alt="손을 흔드는 흰머리오목눈이 오목이" />
      <h1 className="mt-6 text-[32px] font-bold tracking-tight text-ink-900">
        온기<span className="align-super text-lg text-brown-600">°</span>
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
        내 생각을 가볍게 얘기하고,
        <br />
        하루에 하나씩 작은 활기를.
      </p>

      <div className="mt-10 w-full max-w-[340px]">
        {/* 나중에 Supabase 카카오 로그인을 붙이면 여기서 signInWithOAuth({ provider: 'kakao' })를 부르고, 로그인이 끝났을 때 completeLogin */}
        <button
          type="button"
          onClick={() => store.completeLogin()}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-[15px] font-semibold text-black/85 active:brightness-95"
        >
          <KakaoSymbol />
          카카오로 시작하기
        </button>
        <p className="mt-3 text-xs text-ink-400">시연 버전이라 아직 실제 카카오 계정과 연결되지 않아요.</p>
      </div>
    </main>
  );
}
