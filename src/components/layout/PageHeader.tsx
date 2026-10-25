import type { ReactNode } from 'react';
import { BellButton, HomeButton } from '@/components/ui/RoundButton';
import { cn } from '@/lib/cn';

type Props = {
  title: ReactNode;
  /** 왼쪽 집(홈) 버튼. 마이페이지처럼 탭 화면이면 끈다 */
  home?: boolean;
  /** 제목 위치. 커뮤니티처럼 집 버튼 옆에 붙이려면 left */
  align?: 'center' | 'left';
};

/** 마을 화면 상단 바 (Figma): 왼쪽 집 버튼, 제목, 오른쪽 알림. 스크롤해도 위에 고정 */
export function PageHeader({ title, home = true, align = 'center' }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className={cn('flex h-14 items-center gap-3 px-4', align === 'center' && 'grid grid-cols-[44px_1fr_44px]')}>
        {home ? <HomeButton className="size-11 rounded-2xl" /> : <span aria-hidden />}
        <h1 className={cn('min-w-0 truncate text-xl font-bold text-cocoa-900', align === 'center' ? 'text-center' : 'flex-1')}>{title}</h1>
        <BellButton className="size-11 rounded-2xl" />
      </div>
    </header>
  );
}
