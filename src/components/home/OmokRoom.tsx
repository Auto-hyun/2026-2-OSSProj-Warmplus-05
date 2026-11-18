'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { XIcon } from '@phosphor-icons/react';
import { getMood } from '@/data/moods';
import { getTest, getTestResult } from '@/data/tests';
import { FortuneNote } from '@/components/home/FortuneNote';
import { DailyMoodQuiz } from '@/components/jar/DailyMoodQuiz';
import { MoodJar } from '@/components/jar/MoodJar';
import { VillageGuide } from '@/components/layout/VillageGuide';
import { JarBanner } from '@/components/me/JarBanner';
import { MusicButton } from '@/components/ui/RoundButton';
import { todayKey } from '@/lib/date';
import { currentJar, JAR_SIZE, shelfMoods } from '@/lib/jar';
import { useLockScroll } from '@/lib/useLockScroll';
import { useApp } from '@/lib/storage/useApp';
import type { AppState } from '@/lib/storage/types';

/** 방 그림(public/village/room-shelves.webp) 원본 크기. 아래 좌표는 모두 이 그림 기준 px */
const ROOM_W = 941;
const ROOM_H = 1672;
const x = (px: number) => `${(px / ROOM_W) * 100}%`;
const y = (px: number) => `${(px / ROOM_H) * 100}%`;

/** 지금 채우는 유리병: 맨 아래 선반 오른쪽 끝에 올린다 (바닥 = 선반 윗면 y 542) */
const JAR = { left: 688, top: 422, width: 86, height: 120 };

/** 선반 위 구슬 자리 (중심 x, 선반별 중심 y·반지름). 구슬이 선반 윗면(237·387·542)에 얹히도록. 아래 5개 → 가운데 6개 → 위 3개 = 14일 */
const SHELVES = [
  { cy: 522, r: 20, xs: [204, 324, 444, 564] },
  { cy: 367, r: 20, xs: [200, 308, 416, 524, 632, 740] },
  { cy: 217, r: 20, xs: [302, 422, 542, 662] },
];
const SPHERES = SHELVES.flatMap((s) => s.xs.map((cx) => ({ cx, cy: s.cy, r: s.r })));

/**
 * 말풍선: 오목이가 오늘의 다음 할 일을 안내한다 (누르면 그곳으로 이동).
 * 처음 온 사람에겐 대화를 먼저 소개하고, 오늘 할 일(마음날씨 → 노래)을 다 하면 기록을 떠올리는 멘트가 돌아간다
 */
function bubbleLine(state: AppState): { main: string; sub: string; href: string } {
  const today = todayKey();

  // ① 아직 오목이와 이야기해 본 적 없음: 대화부터 소개
  if (state.chat.messages.length === 0)
    return { main: '처음 보는 얼굴이다! 난 오목이야', sub: '심심하면 언제든 말 걸어 줘', href: '/chat' };

  // ② 오늘 마음을 아직 기록 안 함: 마음날씨로
  const todayMood = state.moods.find((m) => m.day === today);
  if (!todayMood) return { main: '오늘 하루 어땠어?', sub: '마음날씨 들려주러 가기 ›', href: '/today' };

  // ③ 기록은 했는데 오늘 노래는 아직: 공방으로
  const songToday = state.pending.length > 0 || state.songs.some((s) => todayKey(new Date(s.createdAt)) === today);
  if (!songToday)
    return { main: `오늘 ${getMood(todayMood.mood).label}이었구나`, sub: '이 마음, 노래로 만들러 가기 ›', href: '/create' };

  // ④ 오늘 할 일 끝: 기록을 떠올리는 멘트 로테이션 (날짜 + 대화 수로 골라 날마다 바뀜)
  const lines = [{ main: '오늘도 마음 들려줘서 고마워', sub: '더 하고 싶은 얘기 있으면 와' }];
  const latestTest = state.tests[0];
  const test = latestTest && getTest(latestTest.testId);
  const result = test && latestTest && getTestResult(test, latestTest.resultId);
  if (result) lines.push({ main: `저번에 ‘${result.name}’ 나왔던 거 기억나?`, sub: '요즘은 어떤지 궁금해' });
  const song = state.songs.find((s) => s.saved) ?? state.songs[0];
  if (song) lines.push({ main: `「${song.title}」 오늘도 들었어?`, sub: '나는 가끔 흥얼거려' });
  if (state.profile.birth) lines.push({ main: '오하아사 쪽지 봤어?', sub: '왼쪽 쪽지에 오늘 운세가 들어 있어' });
  const dayNumber = Number(today.replaceAll('-', ''));
  return { ...lines[(dayNumber + state.chat.messages.length) % lines.length], href: '/chat' };
}

/**
 * 홈: 오목이 집 (Figma "온기 · 홈 & 마음 마을"). 방 그림 위에 오늘의 마음날씨 → 선반 → 말풍선과 감정 친구들 → 오하아사 쪽지.
 * 그림 속 유리병에는 지금 병의 구슬, 선반 유리구슬 자리에는 다 찬 병들의 구슬이 채워진다 (로직은 lib/jar 그대로)
 * 방 그림이 화면 맨 위부터 탭 바까지 꽉 채우고, 상단 버튼들은 그림 위에 겹친다. 홈은 한 화면에 고정돼 스크롤되지 않는다
 * (화면이 길면 그림 좌우가, 짧으면 바닥 쪽이 조금 잘린다)
 */
export function OmokRoom() {
  const jar = useApp((s) => currentJar(s.moods));
  const shelf = useApp((s) => shelfMoods(s.moods, SPHERES.length));
  const bubble = useApp(bubbleLine);
  const [jarOpen, setJarOpen] = useState(false);
  useLockScroll();

  return (
    // 휴대폰 한 화면 높이(h-dvh)에 고정하고 문서 스크롤을 막는다 (-mb-44: 탭 레이아웃의 아래 여백 상쇄)
    <section aria-label="오목이 집" className="relative -mb-44 h-dvh overflow-hidden bg-[#d99c67]">
      {/* 상단: 왼쪽 마을 안내(?), 가운데 오늘의 마음날씨, 오른쪽 내 기록(음표). 처음 온 사람에겐 안내가 한 번 저절로 열린다 */}
      <header className="absolute inset-x-0 top-0 z-20 grid grid-cols-[48px_1fr_48px] items-center gap-2 px-5 pt-[calc(env(safe-area-inset-top)+12px)]">
        <h1 className="sr-only">오목이 집</h1>
        <VillageGuide auto />
        <div className="mx-auto w-full max-w-[280px] min-w-0">
          <DailyMoodQuiz />
        </div>
        <MusicButton className="justify-self-end" />
      </header>

      {/* ? 버튼 아래: 오하아사 쪽지 (누르면 팝업) */}
      <FortuneNote className="absolute top-[calc(env(safe-area-inset-top)+72px)] left-4 z-20 w-[64px]" />

      {/* 방 그림: 화면 맨 위부터 탭 바(76px) 위까지 덮는다. 가운데 기준으로 좌우·바닥이 잘릴 수 있다 */}
      <div
        className="@container absolute top-0 left-1/2 isolate -translate-x-1/2"
        style={{ aspectRatio: `${ROOM_W} / ${ROOM_H}`, width: `max(100%, calc((100dvh - 76px) * ${ROOM_W / ROOM_H}))` }}
      >
        <Image src="/village/room-shelves.webp" alt="" fill preload sizes="480px" className="-z-10 object-cover" />

        {/* 기억 선반: 지금 모으는 구슬이 하루 하나씩 선반 위에 놓인다 (14일차에 병으로 옮겨 담기) */}
        {shelf?.map((entry, i) => {
          const { cx, cy, r } = SPHERES[i];
          const color = getMood(entry.mood).color;
          const size = r * 2;
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

        {/* 맨 아래 선반 오른쪽: 지금 채우는 유리병. 누르면 내 마음 병 팝업 */}
        <button
          type="button"
          aria-label="내 마음 병 보기"
          onClick={() => setJarOpen(true)}
          className="absolute transition-transform active:scale-95"
          style={{ left: x(JAR.left), top: y(JAR.top), width: x(JAR.width), height: y(JAR.height) }}
        >
          <MoodJar caption={false} empty className="h-full [filter:drop-shadow(0_4px_6px_rgba(80,55,20,0.18))]" />
        </button>
        {jar && (
          <p
            className="absolute -translate-x-1/2 rounded-lg bg-cream/95 px-2 py-0.5 text-[11px] whitespace-nowrap text-cocoa-900 shadow-[0_4px_12px_rgba(75,46,32,0.10)]"
            style={{ left: x(JAR.left + JAR.width / 2), top: y(570) }}
          >
            {jar.number}번째 병 · {jar.entries.length}/{JAR_SIZE}
          </p>
        )}

        {/* 감정 친구들 (러그 위) + 말풍선 (친구들 머리 위, 겹치지 않게) */}
        <Link href="/chat" aria-label="감정 친구들과 대화하기" className="absolute left-[17.5%] w-[65%]" style={{ top: y(772) }}>
          <Image
            src="/village/friends.webp"
            alt=""
            width={900}
            height={625}
            sizes="(max-width: 480px) 65vw, 312px"
            draggable={false}
            className="h-auto w-full select-none motion-safe:animate-[omok-bob_3.2s_ease-in-out_infinite] [filter:drop-shadow(0_8px_12px_rgba(80,55,20,0.22))]"
          />
        </Link>
        <Link
          href={bubble?.href ?? '/chat'}
          aria-label={bubble?.main ?? '오목이와 대화하기'}
          className="absolute left-[8%] w-max max-w-[72%] transition-transform active:scale-[0.98]"
          style={{ top: y(578) }}
        >
          <span className="block rounded-[26px] bg-[#fffdf8] px-[4cqw] py-[2.4cqw] text-center whitespace-nowrap shadow-[0_8px_22px_rgba(75,46,32,0.14)]">
            <span className="block text-[clamp(12px,4.1cqw,16px)] font-bold text-cocoa-900">{bubble?.main ?? '오늘은 어떤 마음으로 왔어?'}</span>
            <span className="mt-0.5 block text-[clamp(10px,3.3cqw,13px)] text-cocoa-900">{bubble?.sub ?? '천천히 이야기해도 괜찮아'}</span>
          </span>
          {/* 말풍선 꼬리 (아래 친구들 쪽) */}
          <svg aria-hidden viewBox="0 0 24 18" className="absolute -bottom-[13px] left-[58%] h-[18px] w-6">
            <path d="M2 0 H22 Q10 4 4 18 Q6 8 2 0 Z" fill="#fffdf8" />
          </svg>
        </Link>

      </div>

      {/* 유리병 팝업: 마이페이지에 있던 마음 병 배너(그림+내 마음 보러가기)를 그대로 보여 준다 */}
      {jarOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="내 마음 병"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5"
          onClick={() => setJarOpen(false)}
        >
          <div className="max-h-[85dvh] w-full max-w-[400px] overflow-y-auto rounded-3xl bg-bg p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-1 pb-2">
              <h2 className="text-lg font-bold text-cocoa-900">내 마음 병</h2>
              <button
                type="button"
                aria-label="닫기"
                onClick={() => setJarOpen(false)}
                className="grid size-9 place-items-center rounded-xl text-taupe-500 active:bg-black/5"
              >
                <XIcon size={20} aria-hidden />
              </button>
            </div>
            <JarBanner />
          </div>
        </div>
      )}
    </section>
  );
}
