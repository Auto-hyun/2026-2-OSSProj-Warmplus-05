'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getMood } from '@/data/moods';
import { FortuneNote } from '@/components/home/FortuneNote';
import { DailyMoodQuiz } from '@/components/jar/DailyMoodQuiz';
import { MoodJar } from '@/components/jar/MoodJar';
import { BellButton, HomeButton } from '@/components/ui/RoundButton';
import { currentJar, JAR_SIZE, shelfMoods } from '@/lib/jar';
import { useApp } from '@/lib/storage/useApp';

/** 방 그림(public/village/room.webp) 원본 크기. 아래 좌표는 모두 이 그림 기준 px */
const ROOM_W = 941;
const ROOM_H = 1672;
const x = (px: number) => `${(px / ROOM_W) * 100}%`;
const y = (px: number) => `${(px / ROOM_H) * 100}%`;

/** 그림 속 작은 유리병 안쪽 */
const JAR = { left: 656, top: 472, width: 72, height: 94 };

/** 그림 속 선반 위 빈 유리구슬 자리 (중심 x, 선반별 중심 y·반지름). 앞(아래) 선반이 가장 최근 기록 */
const SHELVES = [
  { cy: 522, r: 22, xs: [186, 251, 315, 379, 442, 506, 569] },
  { cy: 366, r: 22, xs: [189, 253, 316, 379, 444, 507, 568, 627, 687, 748] },
  { cy: 219, r: 21, xs: [231, 287, 341, 396, 451, 508, 565, 622, 679] },
];
const SPHERES = SHELVES.flatMap((s) => s.xs.map((cx) => ({ cx, cy: s.cy, r: s.r })));

/**
 * 홈: 오목이 집 (Figma "온기 · 홈 & 마음 마을"). 방 그림 위에 오늘의 마음날씨 → 선반 → 말풍선과 감정 친구들 → 오하아사 쪽지.
 * 그림 속 유리병에는 지금 병의 구슬, 선반 유리구슬 자리에는 다 찬 병들의 구슬이 채워진다 (로직은 lib/jar 그대로)
 * 화면 높이에 방 그림을 맞춰 홈은 스크롤되지 않는다 (좁은 화면에서는 바닥 쪽만 잘림)
 */
export function OmokRoom() {
  const jar = useApp((s) => currentJar(s.moods));
  const shelf = useApp((s) => shelfMoods(s.moods, SPHERES.length));
  const chatted = useApp((s) => s.chat.messages.length > 0);

  return (
    <section aria-label="오목이 집" className="relative -mb-44 flex h-dvh flex-col overflow-hidden bg-[#d99c67]">
      {/* 상단 바: 방 그림 윗부분을 뒤집어 이어 붙여, 그림이 위로 이어지는 것처럼 */}
      <header className="relative isolate flex items-center justify-between overflow-hidden px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-3">
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 -scale-y-100" style={{ aspectRatio: `${ROOM_W} / ${ROOM_H}` }}>
          <Image src="/village/room.webp" alt="" fill sizes="480px" className="object-cover" />
        </div>
        <HomeButton />
        <h1 className="sr-only">오목이 집</h1>
        {/* 가운데: 오늘의 마음날씨 (홈·알림 버튼과 같은 줄) */}
        <div className="mx-3 w-[272px] max-w-[62%]">
          <DailyMoodQuiz />
        </div>
        <BellButton />
      </header>

      {/* 방 그림: 남은 높이에 맞춰 축소 (폭이 모자라면 100%로 두고 바닥 쪽이 잘린다) */}
      <div
        className="relative isolate mx-auto shrink-0"
        style={{ aspectRatio: `${ROOM_W} / ${ROOM_H}`, width: `min(100%, calc((100dvh - 118px) * ${ROOM_W / ROOM_H}))` }}
      >
        <Image src="/village/room.webp" alt="" fill preload sizes="480px" className="-z-10 object-cover" />

        {/* 기억 선반: 다 찬 병들의 구슬이 유리구슬 자리를 채운다 */}
        {shelf?.map((entry, i) => {
          const { cx, cy, r } = SPHERES[i];
          const color = getMood(entry.mood).color;
          const size = r * 1.8;
          return (
            <span
              key={entry.day}
              aria-hidden
              title={`${entry.day} ${getMood(entry.mood).label}`}
              className="absolute aspect-square rounded-full opacity-90 motion-safe:animate-[glow-pulse_3.5s_ease-in-out_infinite]"
              style={{
                left: x(cx - size / 2),
                top: y(cy - size / 2),
                width: x(size),
                background: `radial-gradient(circle at 32% 30%, #fff 0 12%, ${color} 50%, ${color}dd 100%)`,
                boxShadow: `0 0 8px ${color}aa`,
                animationDelay: `${(i % 3) * 0.7}s`,
              }}
            />
          );
        })}

        {/* 그림 속 유리병 안: 지금 병의 구슬 */}
        <MoodJar bare className="absolute" style={{ left: x(JAR.left), top: y(JAR.top), width: x(JAR.width), height: y(JAR.height) }} />
        {jar && (
          <p
            className="absolute right-[3%] rounded-lg bg-cream/95 px-2 py-0.5 text-[11px] whitespace-nowrap text-cocoa-900 shadow-[0_4px_12px_rgba(75,46,32,0.10)]"
            style={{ top: y(606) }}
          >
            {jar.number}번째 병 · {jar.entries.length}/{JAR_SIZE}
          </p>
        )}

        {/* 감정 친구들 + 말풍선 */}
        <Link href="/chat" aria-label="감정 친구들과 대화하기" className="absolute left-[15%] w-[58%]" style={{ top: y(735) }}>
          <Image
            src="/village/friends.webp"
            alt=""
            width={900}
            height={625}
            sizes="(max-width: 480px) 58vw, 280px"
            draggable={false}
            className="h-auto w-full select-none motion-safe:animate-[omok-bob_3.2s_ease-in-out_infinite] [filter:drop-shadow(0_8px_12px_rgba(80,55,20,0.22))]"
          />
        </Link>
        <Link
          href="/chat"
          aria-label="오목이와 대화하기"
          className="absolute left-[18%] w-[220px] max-w-[60%] transition-transform active:scale-[0.98]"
          style={{ top: y(588) }}
        >
          <span className="block rounded-[30px] bg-[#fffdf8] px-4 py-3 text-center shadow-[0_8px_22px_rgba(75,46,32,0.14)]">
            <span className="block text-base font-bold text-cocoa-900">오늘은 어떤 마음으로 왔어?</span>
            <span className="mt-0.5 block text-[13px] text-cocoa-900">{chatted ? '또 왔구나, 이어서 이야기해 볼까?' : '천천히 이야기해도 괜찮아'}</span>
          </span>
          {/* 말풍선 꼬리 (아래 친구들 쪽) */}
          <svg aria-hidden viewBox="0 0 24 18" className="absolute -bottom-[13px] left-9 h-[18px] w-6">
            <path d="M2 0 H22 Q10 4 4 18 Q6 8 2 0 Z" fill="#fffdf8" />
          </svg>
        </Link>

        {/* 홈 버튼 바로 아래: 오하아사 쪽지 (누르면 팝업) */}
        <FortuneNote className="absolute left-4 w-[64px]" style={{ top: y(10) }} />
      </div>
    </section>
  );
}
