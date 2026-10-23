import type { ReactNode } from 'react';

/** 목록이 비었을 때 */
export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-line px-4 py-5 text-center text-sm text-ink-600">{children}</div>;
}
