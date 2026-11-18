'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { UserIcon, XIcon } from '@phosphor-icons/react';
import { AccountCard } from '@/components/me/AccountCard';
import { ProfileCard } from '@/components/me/ProfileCard';
import { ROUND } from '@/components/ui/RoundButton';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { useLockScroll } from '@/lib/useLockScroll';

/** 지도 배경(public/village/village-map.webp, '지도개정버전') 원본 크기. 아래 좌표는 모두 이 그림 기준 px라 화면 폭이 달라도 구도가 유지된다 */
const W = 941;
const H = 1672;
/** 화면이 그림보다 짧으면 위쪽 하늘을 이만큼까지 잘라 낸다 (그 이상 짧으면 그림 전체가 작아진다) */
const SKY_CROP = 0.12;
/** 그림 맨 위 하늘색: 키 큰 휴대폰에서 그림 위로 남는 자리를 이 색으로 이어 칠한다 */
const SKY = '#d3d4ea';

type Place = {
  name: string;
  /** 없으면 준비 중 */
  href?: string;
  /** public/village 그림과 원본 크기 */
  src: string;
  size: [number, number];
  /** 그림 왼쪽 위(x, y)와 폭 (배경 기준 px). 위치는 '온기_지도' 시안을 따른다 */
  at: { x: number; y: number; w: number };
};

const PLACES: Place[] = [
  { name: '오목이 집', href: '/', src: 'house', size: [600, 646], at: { x: 290, y: 55, w: 320 } },
  { name: '마음 테스트 숲', href: '/tests', src: 'test-forest', size: [600, 596], at: { x: 600, y: 395, w: 305 } },
  { name: '노래 공방', href: '/create', src: 'workshop', size: [600, 534], at: { x: 285, y: 565, w: 380 } },
  { name: '이야기 광장', href: '/community', src: 'plaza', size: [600, 532], at: { x: 40, y: 885, w: 325 } },
  { name: '온스트리밍 TOP100', src: 'stage', size: [600, 522], at: { x: 595, y: 1035, w: 295 } },
  { name: '온기 우체국', src: 'post-office', size: [600, 496], at: { x: 55, y: 1275, w: 345 } },
];

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/** 마음 마을: 마을 그림 위 장소를 누르면 각 기능으로 들어간다. 그림은 public/village에서 교체 가능 */
export function MapScreen() {
  // 오른쪽 위 내 정보 토글: 이름(프로필)과 카카오 계정을 여기서 본다
  const [profileOpen, setProfileOpen] = useState(false);
  useLockScroll();

  return (
    // 휴대폰 한 화면에 고정: 스크롤되지 않는다. 지도는 화면 아래에 붙고, 남는 위쪽은 하늘색으로 이어진다
    <section aria-label="마음 마을" className="relative -mb-44 h-dvh overflow-hidden" style={{ background: SKY }}>
      <header className="absolute inset-x-0 top-0 z-20 grid grid-cols-[48px_1fr_48px] items-start px-5 pt-[calc(env(safe-area-inset-top)+12px)]">
        <span aria-hidden />
        <div className="text-center [text-shadow:0_1px_6px_rgba(255,249,239,0.9)]">
          <h1 className="text-[28px] leading-tight font-bold text-cocoa-900">마음 마을</h1>
          <p className="mt-0.5 text-[14px] text-cocoa-900">마음이 가는 곳으로, 천천히 걸어봐요</p>
        </div>
        <button
          type="button"
          aria-label="내 정보 보기"
          onClick={() => setProfileOpen(true)}
          className={cn(ROUND, 'justify-self-end')}
        >
          <UserIcon size={24} aria-hidden />
        </button>
      </header>

      {/* 내 정보 팝업: 지도를 밀지 않고 위에 뜬다 (홈 유리병 팝업과 같은 방식) */}
      {profileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="내 정보"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5"
          onClick={() => setProfileOpen(false)}
        >
          <div className="max-h-[85dvh] w-full max-w-[400px] overflow-y-auto rounded-3xl bg-bg p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-1 pb-2">
              <h2 className="text-lg font-bold text-cocoa-900">내 정보</h2>
              <button
                type="button"
                aria-label="닫기"
                onClick={() => setProfileOpen(false)}
                className="grid size-9 place-items-center rounded-xl text-taupe-500 active:bg-black/5"
              >
                <XIcon size={20} aria-hidden />
              </button>
            </div>
            <div className="space-y-3">
              <ProfileCard />
              <AccountCard />
            </div>
          </div>
        </div>
      )}

      {/* 지도: 폭에 맞추되, 화면이 짧으면 위 하늘을 SKY_CROP까지 잘라 내고 그래도 모자라면 작아진다 */}
      <nav
        aria-label="마음 마을 장소"
        className="absolute bottom-0 left-1/2 isolate -translate-x-1/2"
        style={{ aspectRatio: `${W} / ${H}`, width: `min(100%, calc(100dvh * ${W / H / (1 - SKY_CROP)}))` }}
      >
        <Image src="/village/village-map.webp" alt="" fill preload sizes="480px" className="-z-10 object-cover" />
        {/* 그림 위 끝을 하늘색으로 부드럽게 이어 붙인다 */}
        <span aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[8%]" style={{ background: `linear-gradient(${SKY}, transparent)` }} />

        <ul>
          {PLACES.map((p) => {
            const content: ReactNode = (
              <>
                <Image
                  src={`/village/${p.src}.webp`}
                  alt=""
                  width={p.size[0]}
                  height={p.size[1]}
                  sizes="200px"
                  draggable={false}
                  className="h-auto w-full select-none [filter:drop-shadow(0_8px_10px_rgba(80,55,20,0.22))]"
                />
                {/* 이름표: 그림 아래쪽 가운데에 살짝 겹친다 */}
                <span className="absolute top-[86%] left-1/2 flex -translate-x-1/2 flex-col items-center gap-1">
                  <span className="rounded-full bg-cream px-3.5 py-1.5 text-[15px] whitespace-nowrap text-cocoa-900 shadow-[0_4px_12px_rgba(75,46,32,0.14)]">
                    {p.name}
                  </span>
                  {!p.href && <span className="rounded-full bg-peach-200 px-2 py-0.5 text-xs text-cocoa-900">준비 중</span>}
                </span>
              </>
            );
            const className = 'absolute block transition-transform active:scale-95';
            const style = { left: pct(p.at.x, W), top: pct(p.at.y, H), width: pct(p.at.w, W) };

            return (
              <li key={p.name}>
                {p.href ? (
                  <Link href={p.href} aria-label={p.name} className={className} style={style}>
                    {content}
                  </Link>
                ) : (
                  <button type="button" aria-label={`${p.name} (준비 중)`} className={className} style={style} onClick={() => toast('준비 중이에요')}>
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
}
