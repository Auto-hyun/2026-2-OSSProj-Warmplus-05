import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ChatScreen } from '@/components/chat/ChatScreen';
import { MobileShell } from '@/components/layout/MobileShell';
import { NamingGate } from '@/components/onboarding/NamingGate';

export const metadata: Metadata = { title: '내 생각 얘기하기 · 온기' };

export default function ChatPage() {
  return (
    <MobileShell>
      {/* 주소로 바로 들어와도 처음 실행이면 이름 짓기부터 */}
      <NamingGate>
        <Suspense fallback={null}>
          <ChatScreen />
        </Suspense>
      </NamingGate>
    </MobileShell>
  );
}
