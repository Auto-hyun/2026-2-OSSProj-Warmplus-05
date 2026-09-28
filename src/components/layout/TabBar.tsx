'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { EnvelopeSimpleIcon, FootprintsIcon, HouseIcon, SparkleIcon, UserIcon, type Icon } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';

/** 홈은 가운데 */
const TABS: { label: string; href: string; Icon: Icon }[] = [
  { label: '미션', href: '/mission', Icon: FootprintsIcon },
  { label: '심리테스트', href: '/tests', Icon: SparkleIcon },
  { label: '홈', href: '/', Icon: HouseIcon },
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
          // 기본 탭인 홈은 어느 화면에서든 노란 원 안에 조금 큰 아이콘으로 강조한다 (글자는 화면 읽기 프로그램에만).
          // 선택되면 탭 배경 대신 원 둘레에 연한 노란 테두리를 두른다
          const home = href === '/';
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-0.5 rounded-full text-[11px] transition-colors',
                  !home && (active ? 'bg-yellow-100 font-semibold text-ink-900' : 'text-ink-400 active:text-ink-600'),
                )}
              >
                {home ? (
                  <span
                    className={cn(
                      'grid size-11 place-items-center rounded-full bg-yellow-500 text-ink-900',
                      active && 'ring-4 ring-yellow-100',
                    )}
                  >
                    <Icon size={26} weight={active ? 'fill' : 'regular'} aria-hidden />
                  </span>
                ) : (
                  <Icon size={24} weight={active ? 'fill' : 'regular'} aria-hidden />
                )}
                <span className={cn(home && 'sr-only')}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
