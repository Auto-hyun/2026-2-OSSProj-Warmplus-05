'use client';

import Link from 'next/link';
import { BellIcon, HouseIcon } from '@phosphor-icons/react';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';

const ROUND = 'grid size-12 shrink-0 place-items-center rounded-[18px] border border-cream-line bg-cream text-cocoa-900 shadow-[0_4px_14px_rgba(75,46,32,0.10)] active:scale-95 transition-transform';

/** 상단 왼쪽 오목이 집(홈) 버튼 */
export function HomeButton({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="오목이 집으로" title="오목이 집" className={cn(ROUND, className)}>
      <HouseIcon size={24} aria-hidden />
    </Link>
  );
}

/** 상단 오른쪽 알림 버튼 (알림 기능은 준비 중) */
export function BellButton({ className }: { className?: string }) {
  return (
    <button type="button" aria-label="알림" onClick={() => toast('알림은 준비 중이에요')} className={cn(ROUND, className)}>
      <BellIcon size={24} aria-hidden />
    </button>
  );
}
