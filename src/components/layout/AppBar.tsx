'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeftIcon, BirdIcon, MapTrifoldIcon } from '@phosphor-icons/react';
import { ButtonLink } from '@/components/ui/Button';

type Props = {
  title: ReactNode;
  right?: ReactNode;
  /** 뒤로 갈 기록이 없을 때(새 탭 등) 이동할 경로. 주면 뒤로 버튼이 생긴다 */
  backHref?: string;
};

/** 제목은 왼쪽, 버튼은 오른쪽. 스크롤해도 위에 고정 */
export function AppBar({ title, right, backHref }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const showMapLink = pathname === '/create' || pathname === '/community';

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push(backHref!);
  }

  return (
    <header className="sticky top-0 z-30 bg-bg/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="flex h-14 items-center gap-1 px-4">
        {pathname !== '/' && backHref === undefined && (
          <Link
            href="/"
            aria-label="오목이 홈"
            title="오목이 홈"
            className="-ml-2 grid size-11 shrink-0 place-items-center rounded-full text-ink-900 active:bg-black/5"
          >
            <BirdIcon size={24} weight="duotone" aria-hidden />
          </Link>
        )}
        {backHref !== undefined && (
          <button
            type="button"
            onClick={goBack}
            aria-label="뒤로 가기"
            className="-ml-2 grid size-11 shrink-0 place-items-center rounded-full text-ink-900 active:bg-black/5"
          >
            <ArrowLeftIcon size={24} aria-hidden />
          </button>
        )}
        <h1 className="min-w-0 flex-1 truncate text-xl font-bold text-ink-900">{title}</h1>
        {(showMapLink || right) && (
          <div className="-mr-1 flex shrink-0 items-center gap-1">
            {showMapLink && (
              <ButtonLink href="/map" variant="ghost" className="h-11! gap-1! px-3! text-sm!">
                <MapTrifoldIcon size={18} aria-hidden />
                지도로
              </ButtonLink>
            )}
            {right}
          </div>
        )}
      </div>
    </header>
  );
}
