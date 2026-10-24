'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BellButton, HomeButton } from '@/components/ui/RoundButton';
import { toast } from '@/components/ui/Toast';
import { TESTS } from '@/data/tests';

/** 지도 기준 크기(px, Figma 프레임). 위치는 이 크기에 대한 %로 둬서 화면 폭이 달라도 구도가 유지된다 */
const W = 390;
const H = 694;

type Place = {
  name: string;
  /** 없으면 준비 중 */
  href?: string;
  /** public/village 그림과 원본 크기 */
  src: string;
  size: [number, number];
  /** 그림 왼쪽 위(x, y)와 폭, 이름표 왼쪽 위 (모두 기준 크기 px) */
  at: { x: number; y: number; w: number };
  label: { x: number; y: number };
};

const PLACES: Place[] = [
  { name: '오목이 집', href: '/', src: 'house', size: [600, 647], at: { x: 147, y: 32, w: 103 }, label: { x: 125, y: 157 } },
  { name: '노래 공방', href: '/create', src: 'workshop', size: [600, 534], at: { x: 10, y: 160, w: 160 }, label: { x: 12, y: 306 } },
  { name: '마음 테스트 숲', href: `/tests/${TESTS[0].id}`, src: 'test-forest', size: [600, 598], at: { x: 222, y: 185, w: 152 }, label: { x: 220, y: 335 } },
  { name: '이야기 광장', href: '/community', src: 'plaza', size: [600, 534], at: { x: 7, y: 345, w: 167 }, label: { x: 15, y: 496 } },
  { name: '온스트리밍 TOP100', src: 'stage', size: [600, 523], at: { x: 217, y: 382, w: 155 }, label: { x: 216, y: 527 } },
  { name: '온기 우체국', src: 'post-office', size: [600, 497], at: { x: 15, y: 540, w: 143 }, label: { x: 10, y: 662 } },
];

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/** 마음 마을: 마을 그림 위 장소를 누르면 각 기능으로 들어간다. 그림은 public/village에서 교체 가능 */
export function MapScreen() {
  return (
    <>
      <header className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-3">
        <HomeButton />
        <h1 className="text-[28px] font-bold text-cocoa-900">마음 마을</h1>
        <BellButton />
      </header>

      <nav aria-label="마음 마을 장소" className="relative isolate w-full overflow-hidden" style={{ aspectRatio: `${W} / ${H}` }}>
        <Image src="/village/map-bg.webp" alt="" fill preload sizes="480px" className="-z-10 object-cover" />
        <p className="absolute inset-x-0 top-[1%] text-center text-[15px] text-cocoa-900 [text-shadow:0_1px_6px_rgba(255,249,239,0.9)]">
          마음이 가는 곳으로, 천천히 걸어봐요
        </p>

        <ul>
          {PLACES.map((p) => {
            const h = (p.at.w * p.size[1]) / p.size[0];
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
                <span
                  className="absolute flex flex-col items-center gap-1"
                  style={{ left: pct(p.label.x - p.at.x, p.at.w), top: pct(p.label.y - p.at.y, h) }}
                >
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
    </>
  );
}
