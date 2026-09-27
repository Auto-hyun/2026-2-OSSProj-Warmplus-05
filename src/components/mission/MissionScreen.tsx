'use client';

import { useState } from 'react';
import { AppBar } from '@/components/layout/AppBar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Toast, useToast } from '@/components/ui/Toast';
import type { Mission } from '@/data/missions';
import { getStage } from '@/data/stages';
import type { DayKey } from '@/lib/date';
import { josa } from '@/lib/josa';
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
  /** 완료 시트를 연 순간의 날짜·미션 (그사이 자정이 지나도 이 날짜로만 완료를 시도한다) */
  const [sheet, setSheet] = useState<{ dayKey: DayKey; mission: Mission } | null>(null);
  const [pickedDay, setPickedDay] = useState<DayKey | null>(null);
  const { toast, showToast } = useToast(2500);

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
  const birdName = state.profile.birdName;

  function complete(note: string) {
    const result = store.completeMission({ note, dayKey: sheet?.dayKey });
    setSheet(null);
    showToast(
      result.ok
        ? `잘했어요! ${josa(birdName, '이/가')} 기뻐해요`
        : result.reason === 'day-changed'
          ? '자정이 지나 날짜가 바뀌었어요. 오늘의 미션을 확인해 주세요.'
          : '오늘 미션은 이미 완료했어요.',
    );
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
            name={birdName}
            canSwap={canSwap}
            onComplete={() => setSheet({ dayKey: today, mission })}
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

        <section aria-label="오목이 성장" className="rounded-2xl bg-surface p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-[15px] font-semibold text-ink-900">오목이 성장 · {getStage(growth.current).name}</p>
            <p className="text-[13px] text-ink-600">
              {growth.next ? `다음 단계까지 ${growth.remaining}개` : '다 자랐어요!'}
            </p>
          </div>
          <div className="mt-3">
            <ProgressBar value={growth.ratio} label="다음 단계까지 진행률" />
          </div>
        </section>
      </div>

      <CompleteSheet open={sheet !== null} mission={sheet?.mission ?? mission} onClose={() => setSheet(null)} onSubmit={complete} />
      <DayDetailSheet dayKey={pickedDay} record={pickedDay ? state.missions.records[pickedDay] : undefined} onClose={() => setPickedDay(null)} />

      <Toast message={toast} />
    </>
  );
}
