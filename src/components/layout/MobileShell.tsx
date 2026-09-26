import type { ReactNode } from 'react';

/** 휴대폰 폭 컬럼. PC에서는 가운데 480px로 보여준다 */
export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-bg sm:shadow-[0_0_0_1px_var(--color-line)]">
      {children}
    </div>
  );
}
