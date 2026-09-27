'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AppBar } from '@/components/layout/AppBar';
import { HelplineCard } from '@/components/ui/HelplineCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Toast, useToast } from '@/components/ui/Toast';
import { completedCount, daysTogether, displayStage, monthCompletedCount, realStage, talkedDaysCount } from '@/lib/storage/selectors';
import { useOngi, useStore, useToday } from '@/lib/storage/useOngi';
import { ChatRecordList } from './ChatRecordList';
import { GrowthAlbum } from './GrowthAlbum';
import { OngiLinks } from './OngiLinks';
import { ProfileCard } from './ProfileCard';
import { SavedLetterList } from './SavedLetterList';
import { SettingsSection } from './SettingsSection';
import { StatsTiles } from './StatsTiles';
import { TestRecordList } from './TestRecordList';

const APP_VERSION = '0.1.0';
const SECRET_TAPS = 5;
const SECRET_WINDOW_MS = 2000;

function SectionTitle({ children }: { children: string }) {
  return <h2 className="mb-3 text-[15px] font-bold text-ink-900">{children}</h2>;
}

export function MeScreen() {
  const store = useStore();
  const router = useRouter();
  const state = useOngi((s) => s);
  const today = useToday();
  const taps = useRef<number[]>([]);
  const { toast, showToast } = useToast(2000);

  if (!state || !today) {
    return (
      <>
        <AppBar title="나의 온기" />
        <div className="space-y-4 px-5">
          <Skeleton className="h-44" />
          <Skeleton className="h-20" />
        </div>
      </>
    );
  }

  // 버전 정보를 2초 안에 5번 누르면 시연 모드를 켜고 끈다
  function onVersionTap() {
    const now = Date.now();
    taps.current = [...taps.current, now].filter((t) => now - t <= SECRET_WINDOW_MS);
    if (taps.current.length < SECRET_TAPS) return;
    taps.current = [];
    const next = !store.getState().settings.demoMode;
    store.demo.setEnabled(next);
    showToast(next ? '시연 모드를 켰어요' : '시연 모드를 껐어요');
  }

  const [year, month] = today.split('-').map(Number);

  return (
    <>
      <AppBar title="나의 온기" />
      <div className="space-y-7 px-5">
        <ProfileCard
          birdName={state.profile.birdName}
          stage={displayStage(state)}
          count={completedCount(state)}
          daysTogether={daysTogether(state, today)}
          onRename={(name) => store.renameBird(name)}
        />
        <StatsTiles total={completedCount(state)} thisMonth={monthCompletedCount(state, year, month)} talkedDays={talkedDaysCount(state)} />

        <section>
          <SectionTitle>성장 앨범</SectionTitle>
          <GrowthAlbum reached={realStage(state)} />
        </section>

        <section>
          <SectionTitle>마음 기록</SectionTitle>
          <ChatRecordList chats={state.chats} today={today} />
        </section>

        <section>
          <SectionTitle>나의 테스트 결과</SectionTitle>
          <TestRecordList records={state.tests} />
        </section>

        {state.savedLetters.length > 0 && (
          <section>
            <SectionTitle>오목이 가방 속 편지</SectionTitle>
            <SavedLetterList ids={state.savedLetters} />
          </section>
        )}

        <section>
          <SectionTitle>온기와 함께하기</SectionTitle>
          <OngiLinks />
        </section>

        <HelplineCard />

        <SettingsSection
          version={APP_VERSION}
          onVersionTap={onVersionTap}
          onReset={() => {
            store.resetAll();
            router.push('/');
          }}
        />
      </div>

      <Toast message={toast} />
    </>
  );
}
