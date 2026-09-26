import type { ReactNode } from 'react';
import { MobileShell } from '@/components/layout/MobileShell';
import { StorageNotice } from '@/components/layout/StorageNotice';
import { TabBar } from '@/components/layout/TabBar';
import { EvolutionWatcher } from '@/components/mascot/EvolutionWatcher';
import { DemoPanel } from '@/components/demo/DemoPanel';

/** 하단 탭 바가 있는 화면들 (홈·미션·온기레터·나의 온기) */
export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <MobileShell>
      <StorageNotice />
      <main className="pb-28">{children}</main>
      <TabBar />
      <EvolutionWatcher />
      <DemoPanel />
    </MobileShell>
  );
}
