'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HouseIcon, MapTrifoldIcon, UserIcon, type Icon } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';

const TABS: { label: string; href: string; Icon: Icon }[] = [
  { label: '홈', href: '/', Icon: HouseIcon },
  { label: '지도', href: '/map', Icon: MapTrifoldIcon },
  { label: '마이페이지', href: '/me', Icon: UserIcon },
];

/** 지도 안 장소들. 여기 있을 때도 "지도" 탭을 켠다 */
const MAP_PLACES = ['/create', '/community'];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (href === '/map' && MAP_PLACES.includes(pathname)) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** 화면 맨 아래에 붙은 크림색 하단 바 (위쪽 모서리만 둥글게) */
export function TabBar() {
  const pathname = usePathname();

  return (
    <nav aria-label="주요 메뉴" className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px]">
      <ul className="flex rounded-t-[36px] border-t border-cream-line bg-cream px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)] shadow-[0_-6px_20px_rgba(75,46,32,0.08)]">
        {TABS.map(({ label, href, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-[60px] flex-col items-center justify-center gap-1 rounded-2xl text-[13px] transition-colors',
                  active ? 'font-semibold text-leaf-600' : 'text-taupe-500 active:bg-black/5',
                )}
              >
                <Icon size={26} weight={active ? 'duotone' : 'regular'} aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
