'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';

export const ROUND = 'grid size-12 shrink-0 place-items-center rounded-[18px] border border-cream-line bg-cream text-cocoa-900 shadow-[0_4px_14px_rgba(75,46,32,0.10)] active:scale-95 transition-transform';

/** 그림 아이콘(public/icons) 버튼: 상자 없이 그림만, 누르는 영역은 56px */
export const ART_BUTTON = 'grid shrink-0 place-items-center transition-transform active:scale-95';

/** public/icons 그림 아이콘. 그림마다 비율이 달라 상자 안에 맞춰(contain) 보여 준다 */
export function ArtIcon({ name, className = 'size-full' }: { name: 'guide' | 'my-songs' | 'fortune' | 'map'; className?: string }) {
  return (
    <Image
      src={`/icons/${name}.webp`}
      alt=""
      width={256}
      height={256}
      sizes="72px"
      draggable={false}
      className={cn('object-contain select-none [filter:drop-shadow(0_4px_6px_rgba(80,55,20,0.22))]', className)}
    />
  );
}

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
    <Link href="/me" aria-label="내 기록" title="내 기록" className={cn(ART_BUTTON, 'size-16', className)}>
      <ArtIcon name="my-songs" />
    </Link>
  );
}
