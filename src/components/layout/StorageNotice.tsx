'use client';

import { useIsPersistent } from '@/lib/storage/useOngi';

/** localStorage를 쓸 수 없는 브라우저(사생활 보호 모드 등)에서만 보이는 안내 */
export function StorageNotice() {
  const persistent = useIsPersistent();
  if (persistent !== false) return null;
  return (
    <p role="status" className="bg-yellow-100 px-4 py-2 text-center text-xs text-ink-600">
      이 브라우저에서는 기록이 저장되지 않아요. 창을 닫으면 사라져요.
    </p>
  );
}
