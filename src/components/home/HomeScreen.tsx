'use client';

import { MoodCheckIn } from '@/components/jar/MoodCheckIn';
import { MoodJar } from '@/components/jar/MoodJar';
import { AppBar } from '@/components/layout/AppBar';
import { formatKoreanDate, todayKey } from '@/lib/date';
import { useApp } from '@/lib/storage/useApp';
import { FortuneSection } from './FortuneSection';
import { TestInvite } from './TestInvite';

/** 탭 1: 오목이가 심리테스트를 권하고, 아래에 오하아사(오늘의 별자리 순위) */
export function HomeScreen() {
  // 오늘 날짜는 브라우저에서만 센다 (서버 렌더 때는 비워 둔다)
  const today = useApp(() => todayKey());

  return (
    <>
      <AppBar title="오목이" right={<span className="text-sm text-ink-400">{today && formatKoreanDate(today)}</span>} />
      <div className="space-y-5 px-4">
        <MoodCheckIn />
        {/* 오목이 뒤 오른쪽에 유리병 */}
        <div className="relative">
          <MoodJar className="absolute right-0 bottom-0 h-40" />
          <TestInvite />
        </div>
        <FortuneSection />
      </div>
    </>
  );
}
