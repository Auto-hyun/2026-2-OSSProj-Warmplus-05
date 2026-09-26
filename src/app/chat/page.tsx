import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ChatScreen } from '@/components/chat/ChatScreen';
import { MobileShell } from '@/components/layout/MobileShell';

export const metadata: Metadata = { title: '털어놓기 · 온기' };

export default function ChatPage() {
  return (
    <MobileShell>
      <Suspense fallback={null}>
        <ChatScreen />
      </Suspense>
    </MobileShell>
  );
}
