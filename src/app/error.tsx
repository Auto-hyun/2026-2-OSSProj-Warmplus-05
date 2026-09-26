'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/lib/storage/useOngi';

type Props = {
  error: Error & { digest?: string };
  retry: () => void;
};

/**
 * 화면을 그리다 예상하지 못한 오류가 나면 보여준다.
 * 저장된 기록 때문에 계속 같은 오류가 나면 이 기기의 기록을 지우고 새로 시작할 수 있다.
 * (오류가 난 컴포넌트를 다시 쓰지 않도록 마스코트 없이 단순하게 그린다)
 */
export default function ErrorPage({ retry }: Props) {
  const store = useStore();
  const [confirming, setConfirming] = useState(false);

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col items-center justify-center px-8 text-center">
      <h1 className="text-xl font-bold text-ink-900">화면을 여는 중에 문제가 생겼어요</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">
        잠시 후 다시 시도해 주세요.
        <br />
        계속 같은 화면이 나오면 이 기기의 기록을 초기화할 수 있어요.
      </p>

      <Button size="lg" full className="mt-8" onClick={retry}>
        다시 시도
      </Button>

      {confirming ? (
        <div className="mt-4 w-full rounded-2xl border border-line bg-surface p-4">
          <p className="text-sm text-ink-900">미션 기록과 대화가 모두 지워져요. 초기화할까요?</p>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" full onClick={() => setConfirming(false)}>
              취소
            </Button>
            <Button
              full
              onClick={() => {
                store.resetAll();
                retry();
              }}
            >
              초기화하기
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="ghost" full className="mt-2" onClick={() => setConfirming(true)}>
          기록 초기화
        </Button>
      )}
    </main>
  );
}
