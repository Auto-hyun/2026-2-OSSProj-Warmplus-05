import type { ReactNode } from 'react';
import { BackButton } from '@/components/ui/RoundButton';
import { cn } from '@/lib/cn';

type Props = {
  title: ReactNode;
  /** 뒤로 가기 목적지. 지도 속 장소 화면은 지도(기본값), 홈에서 들어온 화면은 홈 */
  back?: string;
  /** 제목 위치. 커뮤니티처럼 뒤로 버튼 옆에 붙이려면 left */
  align?: 'center' | 'left';
};

/** 마을 화면 상단 바 (Figma): 왼쪽 뒤로 가기, 제목. 스크롤해도 위에 고정 */
export function PageHeader({ title, back = '/map', align = 'center' }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className={cn('flex h-14 items-center gap-3 px-4', align === 'center' && 'grid grid-cols-[44px_1fr_44px]')}>
        <BackButton href={back} className="size-11 rounded-2xl" />
        <h1 className={cn('min-w-0 truncate text-xl font-bold text-cocoa-900', align === 'center' ? 'text-center' : 'flex-1')}>{title}</h1>
        <span aria-hidden />
      </div>
    </header>
  );
}
