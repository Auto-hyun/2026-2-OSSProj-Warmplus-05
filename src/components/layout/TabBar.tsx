'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type MouseEvent } from 'react';
import { markVillageArrival } from '@/components/map/village';
import { VillageTransition } from '@/components/map/VillageTransition';
import { ArtIcon } from '@/components/ui/RoundButton';
import { cn } from '@/lib/cn';

/** 지도 안 장소들: 왼쪽 위 뒤로 가기가 지도로 이어지니 바를 숨긴다 */
const MAP_PLACES = ['/create', '/community', '/tests'];

/**
 * 화면 맨 아래에 붙은 크림색 하단 바 (위쪽 모서리만 둥글게). 지도와 지도 속 장소에서는 숨긴다.
 * 홈에서 지도를 누르면 문을 지나 마을로 나가는 전환(VillageTransition)을 보여 준 뒤 지도로 간다.
 * 전환 화면은 지도가 열릴 때까지 마지막 장면 그대로 남아 있다가 걷힌다 (그래서 바가 숨어도 여기서 계속 그린다)
 */
export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [going, setGoing] = useState(false);

  // 지도 화면이 그려진 뒤(두 프레임 뒤) 전환 화면을 걷는다
  useEffect(() => {
    if (!going || pathname !== '/map') return;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setGoing(false));
    });
    return () => cancelAnimationFrame(frame);
  }, [going, pathname]);

  function goToMap(e: MouseEvent) {
    if (pathname !== '/' || going) return;
    // '동작 줄이기'를 켠 사람은 바로 이동
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault();
    router.prefetch('/map');
    setGoing(true);
  }

  const hidden = pathname === '/map' || MAP_PLACES.includes(pathname);

  return (
    <>
      {going && (
        <VillageTransition
          onDone={() => {
            markVillageArrival();
            router.push('/map');
          }}
        />
      )}
      {!hidden && (
        <nav
          aria-label="주요 메뉴"
          className={cn('fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] transition-transform duration-300', going && 'translate-y-full')}
        >
          <ul className="flex rounded-t-[36px] border-t border-cream-line bg-cream px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)] shadow-[0_-6px_20px_rgba(75,46,32,0.08)]">
            <li className="flex-1">
              <Link
                href="/map"
                onClick={goToMap}
                className="flex h-[64px] flex-col items-center justify-center rounded-2xl text-[13px] leading-tight text-taupe-500 transition-colors active:bg-black/5"
              >
                <ArtIcon name="map" className="h-11 w-[60px]" />
                <span>지도</span>
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
}
