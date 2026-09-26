'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@phosphor-icons/react';

type Props = {
  title: ReactNode;
  right?: ReactNode;
  /** 뒤로 갈 기록이 없을 때(새 탭 등) 이동할 경로. 주면 뒤로 버튼이 생긴다 */
  backHref?: string;
};

/** 당근처럼 제목은 왼쪽, 아이콘은 오른쪽. 스크롤해도 위에 고정 */
export function AppBar({ title, right, backHref }: Props) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push(backHref!);
  }

  return (
    <header className="sticky top-0 z-30 bg-bg/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="flex h-14 items-center gap-1 px-4">
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
        {right && <div className="-mr-2 flex shrink-0 items-center">{right}</div>}
      </div>
    </header>
  );
}
