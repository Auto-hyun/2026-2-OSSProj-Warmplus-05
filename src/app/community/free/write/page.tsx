import { Suspense } from 'react';
import { MiniPlayer } from '@/components/audio/MiniPlayer';
import { FreeWriteScreen } from '@/components/community/FreeWriteScreen';
import { MobileShell } from '@/components/layout/MobileShell';

export default function FreeWritePage() {
  return (
    <MobileShell>
      {/* 노래 만들기에서 넘어온 노래(?song=)를 주소에서 읽는다 */}
      <Suspense>
        <FreeWriteScreen />
      </Suspense>
      <MiniPlayer above="bottom" />
    </MobileShell>
  );
}
