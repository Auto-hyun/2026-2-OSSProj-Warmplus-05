'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { XIcon } from '@phosphor-icons/react';
import { todayKey } from '@/lib/date';
import { FortuneSection } from './FortuneSection';

const SEEN_KEY = 'fortune-note-seen';

/**
 * 홈 방 그림 위 접힌 쪽지. 오늘 아직 안 열었으면 알림 점과 함께 살랑이고,
 * 누르면 쪽지가 펼쳐지듯 오하아사 팝업이 열린다 (내용은 FortuneSection 그대로)
 */
export function FortuneNote({ className, style }: { className?: string; style?: CSSProperties }) {
  const [open, setOpen] = useState(false);
  const [seenToday, setSeenToday] = useState(true);

  // localStorage는 클라이언트에서만 읽는다 (서버 렌더와 어긋나지 않게)
  useEffect(() => {
    try {
      setSeenToday(localStorage.getItem(SEEN_KEY) === todayKey());
    } catch {}
  }, []);

  const openNote = () => {
    setOpen(true);
    setSeenToday(true);
    try {
      localStorage.setItem(SEEN_KEY, todayKey());
    } catch {}
  };

  return (
    <>
      <button
        type="button"
        onClick={openNote}
        aria-label="오늘의 오하아사 쪽지 열기"
        className={`transition-transform active:scale-[0.95] ${seenToday ? '' : 'motion-safe:animate-[note-wiggle_3.4s_ease-in-out_infinite]'} ${className ?? ''}`}
        style={style}
      >
        <svg viewBox="0 0 64 50" aria-hidden className="h-auto w-full [filter:drop-shadow(0_6px_10px_rgba(80,55,20,0.28))]">
          <rect x="2" y="8" width="60" height="38" rx="7" fill="#fffdf8" stroke="#e5d6bd" strokeWidth="1.5" />
          <path d="M4 14 L32 32 L60 14" fill="none" stroke="#d9b98c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="32" cy="36" r="4.5" fill="#e8a7a0" />
        </svg>
        {!seenToday && (
          <span aria-hidden className="absolute -top-1 -right-1 size-3.5 rounded-full bg-[#e0604f] ring-2 ring-[#fffdf8] motion-safe:animate-[glow-pulse_1.8s_ease-in-out_infinite]" />
        )}
        <span className="mt-1 block rounded-full bg-cream/90 px-1.5 py-0.5 text-center text-[11px] font-bold whitespace-nowrap text-cocoa-900">
          오하아사
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-label="오늘의 오하아사">
          {/* 어두운 배경: 누르면 닫힘 */}
          <button type="button" aria-label="닫기" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/45" />
          {/* 쪽지가 펼쳐지는 패널 */}
          <div className="relative max-h-[82dvh] w-full max-w-[420px] overflow-y-auto rounded-[28px] bg-bg p-5 shadow-[0_18px_48px_rgba(40,25,10,0.35)] motion-safe:animate-[note-unfold_0.45s_ease-out]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-cocoa-900">오늘 나에게 온 쪽지 💌</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="쪽지 닫기"
                className="rounded-full bg-cream p-2 text-cocoa-900 transition-transform active:scale-[0.92]"
              >
                <XIcon size={18} aria-hidden />
              </button>
            </div>
            <FortuneSection />
          </div>
        </div>
      )}
    </>
  );
}
