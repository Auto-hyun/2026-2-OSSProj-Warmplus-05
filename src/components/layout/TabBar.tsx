'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapTrifoldIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';

/** 지도 안 장소들. 여기 있을 때도 "지도" 탭을 켠다 */
const MAP_PLACES = ['/create', '/community', '/tests'];

/** 화면 맨 아래에 붙은 크림색 하단 바 (위쪽 모서리만 둥글게). 지도 화면에서는 숨긴다 */
export function TabBar() {
  const pathname = usePathname();
  if (pathname === '/map') return null;
  const active = MAP_PLACES.includes(pathname);

  return (
    <nav aria-label="주요 메뉴" className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px]">
      <ul className="flex rounded-t-[36px] border-t border-cream-line bg-cream px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)] shadow-[0_-6px_20px_rgba(75,46,32,0.08)]">
        <li className="flex-1">
          <Link
            href="/map"
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex h-[60px] flex-col items-center justify-center gap-1 rounded-2xl text-[13px] transition-colors',
              active ? 'font-semibold text-leaf-600' : 'text-taupe-500 active:bg-black/5',
            )}
          >
            <MapTrifoldIcon size={26} weight={active ? 'duotone' : 'regular'} aria-hidden />
            <span>지도</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
