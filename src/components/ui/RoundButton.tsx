'use client';

import Link from 'next/link';
import { ArrowLeftIcon, MusicNotesSimpleIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';

export const ROUND = 'grid size-12 shrink-0 place-items-center rounded-[18px] border border-cream-line bg-cream text-cocoa-900 shadow-[0_4px_14px_rgba(75,46,32,0.10)] active:scale-95 transition-transform';

/** 상단 왼쪽 뒤로 가기 버튼 (장소 화면은 지도로, 홈에서 들어온 화면은 홈으로) */
export function BackButton({ href, className }: { href: string; className?: string }) {
  return (
    <Link href={href} aria-label="뒤로 가기" className={cn(ROUND, className)}>
      <ArrowLeftIcon size={24} aria-hidden />
    </Link>
  );
}

/** 홈 상단 오른쪽 내 기록(내 노래·테스트·내가 쓴 글) 버튼 */
export function MusicButton({ className }: { className?: string }) {
  return (
    <Link href="/me" aria-label="내 기록" title="내 기록" className={cn(ROUND, className)}>
      <MusicNotesSimpleIcon size={24} aria-hidden />
    </Link>
  );
}
