'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapTrifoldIcon } from '@phosphor-icons/react';

/** 지도 안 장소들: 왼쪽 위 뒤로 가기가 지도로 이어지니 바를 숨긴다 */
const MAP_PLACES = ['/create', '/community', '/tests'];

/** 화면 맨 아래에 붙은 크림색 하단 바 (위쪽 모서리만 둥글게). 지도와 지도 속 장소에서는 숨긴다 */
export function TabBar() {
  const pathname = usePathname();
  if (pathname === '/map' || MAP_PLACES.includes(pathname)) return null;

  return (
    <nav aria-label="주요 메뉴" className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px]">
      <ul className="flex rounded-t-[36px] border-t border-cream-line bg-cream px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)] shadow-[0_-6px_20px_rgba(75,46,32,0.08)]">
        <li className="flex-1">
          <Link
            href="/map"
            className="flex h-[60px] flex-col items-center justify-center gap-1 rounded-2xl text-[13px] text-taupe-500 transition-colors active:bg-black/5"
          >
            <MapTrifoldIcon size={26} aria-hidden />
            <span>지도</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
