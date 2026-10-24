'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapTrifoldIcon, UserIcon, type Icon } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';

const TABS: { label: string; href: string; Icon: Icon }[] = [
  { label: '지도로 가기', href: '/map', Icon: MapTrifoldIcon },
  { label: '마이페이지', href: '/me', Icon: UserIcon },
];

/** 지도 안 장소들. 여기 있을 때도 "지도로 가기" 탭을 켠다 */
const MAP_PLACES = ['/create', '/community'];

function isActive(pathname: string, href: string): boolean {
  if (href === '/map' && MAP_PLACES.includes(pathname)) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** 화면 하단에 떠 있는 반투명 캡슐 탭 바 */
export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 메뉴"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]"
    >
      <ul className="pointer-events-auto flex h-16 rounded-full border border-black/5 bg-white/75 p-1.5 shadow-[0_8px_24px_rgba(47,43,40,0.12)] backdrop-blur-xl">
        {TABS.map(({ label, href, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-0.5 rounded-full text-[11px] transition-colors',
                  active ? 'bg-yellow-100 font-semibold text-ink-900' : 'text-ink-400 active:text-ink-600',
                )}
              >
                <Icon size={24} weight={active ? 'fill' : 'regular'} aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
