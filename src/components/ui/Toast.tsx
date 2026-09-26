'use client';

import { useEffect, useRef, useState } from 'react';

/** 잠깐 보였다 사라지는 알림. 새로 보이면 시간을 처음부터 다시 센다 */
export function useToast(durationMs: number) {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  function showToast(message: string) {
    setToast(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), durationMs);
  }

  return { toast, showToast };
}

/** 하단 탭 바 바로 위에 뜨는 알림 */
export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="status"
      className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+92px)] z-40 mx-auto w-fit animate-[ongi-pop_0.2s_ease-out] rounded-full bg-ink-900 px-4 py-2.5 text-sm font-medium text-white"
    >
      {message}
    </p>
  );
}
