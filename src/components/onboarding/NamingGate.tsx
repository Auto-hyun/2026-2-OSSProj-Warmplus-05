'use client';

import { useState, type ReactNode } from 'react';
import { IntroStory } from '@/components/intro/IntroStory';
import { Mascot } from '@/components/mascot/Mascot';
import { Button } from '@/components/ui/Button';
import { useOngi, useStore } from '@/lib/storage/useOngi';
import { LoginScreen } from './LoginScreen';

const NAME_MAX = 10;
const SUGGESTIONS = ['콩이', '보리', '솜이', '뭉치', '온새'];

/** 처음 실행 때만 보이는 이름 짓기 화면 */
function NamingScreen() {
  const store = useStore();
  const [name, setName] = useState('');
  const [error, setError] = useState(false);
  const empty = name.trim().length === 0;

  function submit() {
    if (!store.completeNaming(name).ok) setError(true);
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+24px)] text-center">
      <Mascot stage={1} size="lg" decorative />
      <h1 className="mt-4 text-[22px] font-bold text-ink-900">작은 알 하나가 도착했어요</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
        이 알 속 오목이와 매일 이야기를 나누고,
        <br />
        미션을 하면 함께 자라요. 이름을 지어주세요.
      </p>

      <form
        className="mt-8 w-full max-w-[340px]"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label htmlFor="bird-name-first" className="sr-only">
          오목이 이름
        </label>
        <input
          id="bird-name-first"
          value={name}
          maxLength={NAME_MAX}
          autoComplete="off"
          placeholder="이름을 지어주세요 (10자까지)"
          onChange={(e) => {
            setName(e.target.value);
            setError(false);
          }}
          className="h-13 w-full rounded-2xl border border-line bg-surface px-4 text-center text-base text-ink-900 outline-none placeholder:text-ink-400 focus:border-brown-600/40"
        />
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setName(suggestion);
                setError(false);
              }}
              className="min-h-11 rounded-full border border-line bg-surface px-4 text-sm text-ink-600 active:bg-yellow-100"
            >
              {suggestion}
            </button>
          ))}
        </div>
        {error && (
          <p role="alert" className="mt-3 text-[13px] text-brown-600">
            1~10자로 지어주세요
          </p>
        )}
        <Button type="submit" size="lg" full className="mt-6" disabled={empty}>
          이름 지어주기
        </Button>
        <button
          type="button"
          onClick={() => store.completeNaming()}
          className="mt-2 min-h-11 w-full rounded-2xl text-sm text-ink-400 active:bg-black/5"
        >
          나중에 할게요 (오목이로 부를게요)
        </button>
      </form>
    </main>
  );
}

/**
 * 처음 방문이면 카카오 로그인 → 이름 짓기 → 시작 화면(먼저 도착한 편지)을 마친 뒤에 앱 화면을 보여준다.
 * notice(기록이 저장되지 않는다는 안내 등)는 로그인·이름 짓기·앱 화면 위에 붙인다. 시작 화면은 고정 상단 바에 따로 보여준다.
 */
export function NamingGate({ children, notice }: { children: ReactNode; notice?: ReactNode }) {
  const step = useOngi(({ profile }) => (!profile.signedIn ? 'login' : !profile.named ? 'naming' : !profile.introSeen ? 'intro' : 'app'));
  if (step === 'intro') return <IntroStory />;
  // 하이드레이션 전(undefined)에는 원래 화면(스켈레톤)을 그대로 둔다
  return (
    <>
      {notice}
      {step === 'login' ? <LoginScreen /> : step === 'naming' ? <NamingScreen /> : children}
    </>
  );
}
