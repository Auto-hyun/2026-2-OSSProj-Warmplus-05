'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { EnvelopeSimpleIcon, FootprintsIcon, HouseIcon, UserIcon, type Icon } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';

const TABS: { label: string; href: string; Icon: Icon }[] = [
  { label: '홈', href: '/', Icon: HouseIcon },
  { label: '미션', href: '/mission', Icon: FootprintsIcon },
  { label: '온기레터', href: '/letters', Icon: EnvelopeSimpleIcon },
  { label: '나의 온기', href: '/me', Icon: UserIcon },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** 당근 앱처럼 화면 하단에 떠 있는 반투명 캡슐 탭 바 */
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
