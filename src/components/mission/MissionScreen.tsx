'use client';

import { useEffect, useRef, useState } from 'react';
import { AppBar } from '@/components/layout/AppBar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { getStage } from '@/data/stages';
import type { DayKey } from '@/lib/date';
import { missionFor, nextStageInfo } from '@/lib/progress';
import { completedCount, monthCompletedCount } from '@/lib/storage/selectors';
import { useOngi, useStore, useToday } from '@/lib/storage/useOngi';
import { CompleteSheet } from './CompleteSheet';
import { DayDetailSheet } from './DayDetailSheet';
import { MissionCalendar } from './MissionCalendar';
import { TodayMissionCard } from './TodayMissionCard';

function shiftMonth(view: { year: number; month: number }, delta: number) {
  const index = view.year * 12 + (view.month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function MissionScreen() {
  const store = useStore();
  const state = useOngi((s) => s);
  const today = useToday();
  const [view, setView] = useState<{ year: number; month: number } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pickedDay, setPickedDay] = useState<DayKey | null>(null);
  const [toast, setToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  if (!state || !today) {
    return (
      <>
        <AppBar title="미션" />
        <div className="space-y-4 px-5">
          <Skeleton className="h-56" />
          <Skeleton className="h-72" />
        </div>
      </>
    );
  }

  const [ty, tm] = today.split('-').map(Number);
  const current = view ?? { year: ty, month: tm };
  const isCurrentMonth = current.year === ty && current.month === tm;
  const record = state.missions.records[today];
  const mission = missionFor(state.profile.installId, today, state.missions.swaps[today]);
  const canSwap = !record && !state.missions.swaps[today];
  const total = completedCount(state);
  const growth = nextStageInfo(total);

  function complete(note: string) {
    store.completeMission({ note });
    setSheetOpen(false);
    setToast(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(false), 2000);
  }

  return (
    <>
      <AppBar title="미션" />
      <div className="space-y-7 px-5">
        <div>
          <TodayMissionCard
            mission={mission}
            done={Boolean(record)}
            note={record?.note}
            canSwap={canSwap}
            onComplete={() => setSheetOpen(true)}
            onSwap={() => store.swapMission()}
          />
          {!record && <p className="mt-3 text-center text-[13px] text-ink-400">오늘 못 해도 괜찮아요. 내일 또 만나요.</p>}
        </div>

        <div>
          <MissionCalendar
            year={current.year}
            month={current.month}
            today={today}
            records={state.missions.records}
            canGoNext={!isCurrentMonth}
            onPrev={() => setView(shiftMonth(current, -1))}
            onNext={() => setView(shiftMonth(current, 1))}
            onPickDay={setPickedDay}
          />
          <p className="mt-4 text-center text-sm font-medium text-ink-600">
            이번 달 {monthCompletedCount(state, ty, tm)}일 · 누적 {total}개
          </p>
        </div>

        <section aria-label="뱁새 성장" className="rounded-2xl bg-surface p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-[15px] font-semibold text-ink-900">뱁새 성장 · {getStage(growth.current).name}</p>
            <p className="text-[13px] text-ink-600">
              {growth.next ? `다음 단계까지 ${growth.remaining}개` : '다 자랐어요!'}
            </p>
          </div>
          <div className="mt-3">
            <ProgressBar value={growth.ratio} label="다음 단계까지 진행률" />
          </div>
        </section>
      </div>

      <CompleteSheet open={sheetOpen} mission={mission} onClose={() => setSheetOpen(false)} onSubmit={complete} />
      <DayDetailSheet dayKey={pickedDay} record={pickedDay ? state.missions.records[pickedDay] : undefined} onClose={() => setPickedDay(null)} />

      {toast && (
        <p
          role="status"
          className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+92px)] z-40 mx-auto w-fit animate-[ongi-pop_0.2s_ease-out] rounded-full bg-ink-900 px-4 py-2.5 text-sm font-medium text-white"
        >
          잘했어요! 뱁새가 기뻐해요
        </p>
      )}
    </>
  );
}
