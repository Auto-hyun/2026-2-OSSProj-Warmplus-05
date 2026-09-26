import { cn } from '@/lib/cn';

/** 기기 저장 데이터를 불러오기 전 자리 표시 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-2xl bg-line/70', className)} />;
}
