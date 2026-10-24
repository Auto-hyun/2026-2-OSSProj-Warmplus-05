'use client';

import Link from 'next/link';
import { getMood } from '@/data/moods';
import { DailyMoodQuiz } from '@/components/jar/DailyMoodQuiz';
import { MoodJar } from '@/components/jar/MoodJar';
import { Omok } from '@/components/omok/Omok';
import { formatKoreanDate, todayKey } from '@/lib/date';
import { currentJar, JAR_SIZE, shelfMoods } from '@/lib/jar';
import { useApp } from '@/lib/storage/useApp';

/** 장면 기준 폭(px). 가로 위치는 이 폭에 대한 %로 둬서 화면 폭이 달라도 구도가 유지된다 */
const W = 390;
const pct = (px: number) => `${(px / W) * 100}%`;

/** 기억 선반 3단: 위(먼 곳)일수록 구슬이 작고 흐리고 옅다 */
const TIERS = [
  { top: 168, left: 40, width: 310, count: 13, size: 15, opacity: 0.55, blur: 1.2 },
  { top: 250, left: 22, width: 346, count: 11, size: 21, opacity: 0.75, blur: 0.6 },
  { top: 344, left: 6, width: 236, count: 7, size: 27, opacity: 0.95, blur: 0 },
];
const SHELF_SLOTS = TIERS.reduce((n, t) => n + t.count, 0);

/**
 * 홈: 오목이 집 (2.5D). 뒤에서 앞으로 벽·기억 선반 → 바닥 → 오늘의 유리병 → 오목이 → 흐린 전경.
 * 선반 구슬 = 다 찬 병들의 기록(앞 선반이 최근), 빈 자리는 옅은 유리 자리. 디자인 교체 대상(뼈대 UI).
 */
export function OmokRoom() {
  const today = useApp(() => todayKey());
  const shelf = useApp((s) => shelfMoods(s.moods, SHELF_SLOTS));
  const jarCount = useApp((s) => currentJar(s.moods).entries.length);
  const todayMood = useApp((s) => s.moods.find((m) => m.day === todayKey())?.mood);
  const chatted = useApp((s) => s.chat.messages.length > 0);

  // 앞 선반부터 최근 기록을 채운다
  let next = 0;
  const tiers = [...TIERS].reverse().map((t) => {
    const slots = Array.from({ length: t.count }, () => shelf?.[next++] ?? null);
    return { ...t, slots };
  }).reverse();

  const line = chatted ? '또 왔구나! 오늘은 무슨 이야기 해 줄래?' : '어서 와! 나를 누르면 이야기할 수 있어.';
  const frontMarble = todayMood ? getMood(todayMood).color : '#F4A7B9';

  return (
    <section aria-label="오목이 집" className="relative h-[760px] overflow-hidden bg-[#f3dcc0]">
      {/* 1. 벽 + 아치 창 빛 */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-[500px] bg-[linear-gradient(180deg,#fff6e8_0%,#fbe7cf_55%,#f2d2ad_100%)]" />
      <div
        aria-hidden
        className="absolute top-[96px] h-[250px] rounded-t-[100px] rounded-b-xl bg-[radial-gradient(ellipse_at_50%_30%,rgba(255,255,255,0.95)_0%,rgba(255,240,205,0.7)_45%,rgba(255,232,190,0)_75%)] blur-[2px]"
        style={{ left: pct(95), width: pct(200) }}
      />

      {/* 2. 기억 선반 */}
      {tiers.map((t, ti) => {
        const gap = (t.width - t.count * t.size) / (t.count - 1);
        return (
          <div key={t.top} aria-hidden>
            <div
              className="absolute rounded-md bg-[linear-gradient(180deg,#c99c62,#9c7240)]"
              style={{
                left: pct(t.left - 6),
                width: pct(t.width + 12),
                top: t.top + t.size - 2,
                height: 6 + ti * 2,
                opacity: 0.7 + ti * 0.15,
                boxShadow: `0 ${3 + ti * 2}px ${6 + ti * 3}px rgba(90,60,25,${0.18 + ti * 0.06})`,
              }}
            />
            {t.slots.map((entry, i) => {
              const color = entry ? getMood(entry.mood).color : null;
              return (
                <span
                  key={i}
                  title={entry ? `${entry.day} ${getMood(entry.mood).label}` : undefined}
                  className={color ? 'absolute rounded-full motion-safe:animate-[glow-pulse_3.5s_ease-in-out_infinite]' : 'absolute rounded-full border border-white/70 bg-white/25'}
                  style={{
                    left: pct(t.left + i * (t.size + gap)),
                    top: t.top - (i % 2) * 2,
                    width: t.size,
                    height: t.size,
                    opacity: color ? t.opacity : t.opacity * 0.6,
                    filter: t.blur ? `blur(${t.blur}px)` : undefined,
                    ...(color && {
                      background: `radial-gradient(circle at 32% 30%, #fff 0 10%, ${color} 48%, ${color}cc 100%)`,
                      boxShadow: `0 0 ${8 + ti * 4}px ${color}99`,
                      animationDelay: `${(i % 3) * 0.7}s`,
                    }),
                  }}
                />
              );
            })}
          </div>
        );
      })}

      {/* 3. 원근 바닥 */}
      <div
        aria-hidden
        className="absolute -inset-x-10 top-[470px] bottom-0 [clip-path:polygon(14%_0,86%_0,100%_100%,0_100%)]"
        style={{ background: 'repeating-linear-gradient(90deg, rgba(133,96,30,0.10) 0 2px, transparent 2px 64px), linear-gradient(180deg, #e2c39b 0%, #d4ab7a 60%, #c99c69 100%)' }}
      />
      <div aria-hidden className="absolute inset-x-0 top-[466px] h-2.5 bg-[linear-gradient(180deg,rgba(133,96,30,0.28),rgba(133,96,30,0))]" />
      <div aria-hidden className="absolute inset-x-[30px] top-[500px] h-[260px] rounded-[50%] bg-[radial-gradient(ellipse_at_50%_45%,rgba(255,245,215,0.75)_0%,rgba(255,240,205,0.25)_50%,rgba(255,240,205,0)_72%)]" />

      {/* 4. 오늘의 유리병 (받침대 위) */}
      <div aria-hidden className="absolute top-[440px] h-9 rounded-[50%] bg-[radial-gradient(ellipse,rgba(60,40,15,0.30),rgba(60,40,15,0)_70%)]" style={{ left: pct(248), width: pct(104) }} />
      <div aria-hidden className="absolute top-[418px] h-10 rounded-[10px] bg-[linear-gradient(180deg,#b98a52,#8d6332)] shadow-[inset_0_2px_0_rgba(255,255,255,0.25)]" style={{ left: pct(254), width: pct(92) }} />
      <div className="absolute top-[312px] h-[110px] -translate-x-1/2" style={{ left: pct(300) }}>
        <MoodJar caption={false} className="h-full" />
      </div>
      {jarCount !== undefined && (
        <p className="absolute top-[470px] rounded-full bg-white/75 px-2.5 py-0.5 text-xs font-bold text-ink-600" style={{ right: pct(22) }}>
          {jarCount} / {JAR_SIZE}
        </p>
      )}

      {/* 5. 오목이 (러그·그림자·말풍선) */}
      <div aria-hidden className="absolute top-[600px] h-[92px] rounded-[50%] bg-[radial-gradient(ellipse,#f6e1c6_0%,#eac9a0_62%,#dcb486_63%,#e7c193_70%,rgba(231,193,147,0)_71%)]" style={{ left: pct(40), width: pct(250) }} />
      <div aria-hidden className="absolute top-[652px] h-[26px] rounded-[50%] bg-[radial-gradient(ellipse,rgba(60,40,15,0.35),rgba(60,40,15,0)_70%)]" style={{ left: pct(95), width: pct(140) }} />
      <Link
        href="/chat"
        aria-label="오목이와 대화하기"
        className="absolute top-[494px] -translate-x-1/2 rounded-3xl transition-transform active:scale-95"
        style={{ left: pct(165) }}
      >
        <span className="block motion-safe:animate-[omok-bob_3.2s_ease-in-out_infinite] [filter:drop-shadow(0_6px_10px_rgba(80,55,20,0.18))]">
          <Omok pose="hello" height={176} eager />
        </span>
      </Link>
      <p
        aria-live="polite"
        className="absolute top-[430px] max-w-[170px] rounded-[18px] rounded-bl-md bg-white/90 px-3.5 py-2.5 text-sm leading-relaxed shadow-[0_6px_18px_rgba(80,55,20,0.14)]"
        style={{ left: pct(150) }}
      >
        {line}
      </p>

      {/* 6. 흐린 전경 (잎사귀, 굴러온 구슬 = 오늘 감정 색) */}
      <svg aria-hidden viewBox="0 0 120 160" className="absolute top-[640px] -left-[26px] h-[170px] w-[130px] opacity-90 blur-[3px]">
        <path d="M60 160 C40 110 10 90 4 40 C40 60 62 96 66 150 Z" fill="#7fae7a" />
        <path d="M66 160 C70 100 96 70 116 30 C122 80 96 120 74 160 Z" fill="#5f9460" />
        <path d="M58 160 C52 120 50 90 62 50 C74 92 70 126 64 160 Z" fill="#8fbf86" />
      </svg>
      <span
        aria-hidden
        className="absolute top-[690px] size-[58px] rounded-full blur-[2.5px]"
        style={{ left: pct(320), background: `radial-gradient(circle at 32% 30%, #fff 0 10%, ${frontMarble} 46%, ${frontMarble}aa 100%)`, boxShadow: `0 0 22px ${frontMarble}cc` }}
      />

      {/* 화면 요소: 상단 + 오늘의 테스트 카드 */}
      <header className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+20px)] pb-2">
        <h1 className="text-[26px] font-bold text-brown-600">오목이 집</h1>
        <span className="text-[13px] text-ink-600">{today && formatKoreanDate(today)}</span>
      </header>
      <div className="absolute inset-x-4 top-[calc(env(safe-area-inset-top)+68px)]">
        <DailyMoodQuiz />
      </div>
    </section>
  );
}
