'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { CaretDownIcon, SlidersHorizontalIcon } from '@phosphor-icons/react';
import { STAGES } from '@/data/stages';
import { cn } from '@/lib/cn';
import { completedCount, realStage } from '@/lib/storage/selectors';
import { useOngi, useStore } from '@/lib/storage/useOngi';

function Chip({ onClick, label, active = false, children }: { onClick: () => void; label: string; active?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn('min-h-8 rounded-lg px-2.5 text-xs font-medium', active ? 'bg-yellow-500 text-ink-900' : 'bg-white/15 text-white active:bg-white/25')}
    >
      {children}
    </button>
  );
}

/**
 * 발표·시연용 조작판. 주소에 ?demo=1을 붙이거나 나의 온기의 버전을 5번 누르면 나타난다.
 * 며칠을 기다리지 않고도 진화 연출·캘린더·오늘의 질문 변화를 바로 보여줄 수 있다.
 */
export function DemoPanel() {
  const store = useStore();
  const info = useOngi((s) => ({
    on: s.settings.demoMode,
    override: s.settings.stageOverride,
    count: completedCount(s),
    real: realStage(s),
  }));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('demo') === '1') store.demo.setEnabled(true);
  }, [store]);

  if (!info?.on) return null;
  const today = store.todayKey();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+92px)] z-50 mx-auto max-w-[480px] px-4">
      <div className="pointer-events-auto inline-block max-w-full rounded-2xl bg-ink-900/90 text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-h-10 items-center gap-1.5 px-3 text-xs font-semibold"
        >
          <SlidersHorizontalIcon size={16} aria-hidden />
          시연 모드
          <CaretDownIcon size={12} className={cn('transition-transform', !open && 'rotate-180')} aria-hidden />
        </button>

        {open && (
          <div className="space-y-2.5 px-3 pb-3">
            <p className="text-[11px] text-white/70">
              누적 {info.count} · 실제 {info.real}단계 · 오늘 {today.slice(5)}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Chip label="미션 +1" onClick={() => store.demo.addCompletion()}>
                미션 +1
              </Chip>
              <Chip label="날짜 +1일" onClick={() => store.demo.shiftDay(1)}>
                날짜 +1일
              </Chip>
              <Chip label="날짜 되돌리기" onClick={() => store.demo.resetDay()}>
                날짜 되돌리기
              </Chip>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-white/70">단계 보기</span>
              {STAGES.map((s) => (
                <Chip key={s.no} label={`${s.no}단계로 보기`} active={info.override === s.no} onClick={() => store.demo.setStageOverride(s.no)}>
                  {s.no}
                </Chip>
              ))}
              <Chip label="단계 표시 해제" active={info.override === null} onClick={() => store.demo.setStageOverride(null)}>
                실제
              </Chip>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Chip
                label="기록 초기화"
                onClick={() => {
                  store.resetAll();
                  store.demo.setEnabled(true);
                }}
              >
                기록 초기화
              </Chip>
              <Chip label="시연 모드 끄기" onClick={() => store.demo.setEnabled(false)}>
                끄기
              </Chip>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
