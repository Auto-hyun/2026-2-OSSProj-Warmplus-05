import type { ReactNode } from 'react';
import { MiniPlayer } from '@/components/audio/MiniPlayer';
import { MobileShell } from '@/components/layout/MobileShell';
import { TabBar } from '@/components/layout/TabBar';

/** 하단 탭 바가 있는 화면들 (오목이·노래 만들기·커뮤니티·마이페이지) */
export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <MobileShell>
      {/* 아래 여백: 떠 있는 재생 바 + 탭 바 */}
      <main className="pb-44">{children}</main>
      <MiniPlayer above="tabs" />
      <TabBar />
    </MobileShell>
  );
}
