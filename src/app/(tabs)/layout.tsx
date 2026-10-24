import type { ReactNode } from 'react';
import { MiniPlayer } from '@/components/audio/MiniPlayer';
import { MobileShell } from '@/components/layout/MobileShell';
import { TabBar } from '@/components/layout/TabBar';

/** 지도·마이페이지 탭 바를 공유하는 홈과 기능 화면들 */
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
