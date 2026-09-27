'use client';

import Link from 'next/link';
import { AppBar } from '@/components/layout/AppBar';
import { Mascot } from '@/components/mascot/Mascot';
import { buttonClass } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { getStage } from '@/data/stages';
import { cn } from '@/lib/cn';
import { formatKoreanDate } from '@/lib/date';
import { missionFor, questionFor } from '@/lib/progress';
import { completedCount, displayStage } from '@/lib/storage/selectors';
import { useOngi, useToday } from '@/lib/storage/useOngi';
import { GrowthLine } from './GrowthLine';
import { QuestionBubble } from './QuestionBubble';
import { TodayMissionShortcut } from './TodayMissionShortcut';

/** 로고처럼 '온기' 오른쪽 위에 도씨 기호(˚)를 붙인 제목 */
function BrandTitle() {
  return (
    <span className="inline-flex items-start">
      온기
      <span aria-hidden className="mt-0.5 ml-0.5 size-2 rounded-full border-2 border-brown-600" />
    </span>
  );
}

export function HomeScreen() {
  const state = useOngi((s) => s);
  const today = useToday();

  if (!state || !today) {
    return (
      <>
        <AppBar title={<BrandTitle />} />
        <div className="flex flex-col items-center gap-4 px-5 pt-8">
          <Skeleton className="h-20 w-full max-w-[320px]" />
          <Skeleton className="size-[208px] rounded-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </>
    );
  }

  const stage = displayStage(state);
  const count = completedCount(state);
  const mission = missionFor(state.profile.installId, today, state.missions.swaps[today]);
  const done = Boolean(state.missions.records[today]);
  const talkedToday = state.chats[today]?.messages.some((m) => m.role === 'user') ?? false;

  return (
    <>
      <AppBar title={<BrandTitle />} />
      <div className="px-5">
        <p className="text-sm text-ink-600">{formatKoreanDate(today)}</p>

        <section aria-label="오늘의 오목이" className="mt-5 flex flex-col items-center">
          <QuestionBubble question={questionFor(today)} />
          <Mascot stage={stage} size="lg" interactive name={state.profile.birdName} className="mt-4" />
          <p className="mt-2 text-lg font-bold text-ink-900">{state.profile.birdName}</p>
          <p className="text-sm text-ink-600">{getStage(stage).name}</p>
          <div className="mt-3 flex w-full justify-center">
            <GrowthLine count={count} name={state.profile.birdName} />
          </div>
        </section>

        <Link href="/chat" className={cn(buttonClass('primary', 'lg', true), 'mt-5')}>
          {talkedToday ? '이어서 이야기하기' : '내 생각 얘기하기'}
        </Link>
        <div className="mt-3">
          <TodayMissionShortcut mission={mission} done={done} />
        </div>
      </div>
    </>
  );
}
