import type { ReactNode } from 'react';
import { DemoPanel } from '@/components/demo/DemoPanel';
import { MobileShell } from '@/components/layout/MobileShell';
import { StorageNotice } from '@/components/layout/StorageNotice';
import { TabBar } from '@/components/layout/TabBar';
import { EvolutionWatcher } from '@/components/mascot/EvolutionWatcher';
import { NamingGate } from '@/components/onboarding/NamingGate';

/** 하단 탭 바가 있는 화면들 (홈·미션·온기레터·나의 온기). 처음 실행이면 뱁새 이름 짓기부터 */
export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <MobileShell>
      {/* 기록이 저장되지 않는다는 안내는 이름을 짓기 전에도 보여준다 */}
      <StorageNotice />
      <NamingGate>
        <main className="pb-28">{children}</main>
        <TabBar />
        <EvolutionWatcher />
        <DemoPanel />
      </NamingGate>
    </MobileShell>
  );
}
