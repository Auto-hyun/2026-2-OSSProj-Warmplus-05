import { Suspense } from 'react';
import { MiniPlayer } from '@/components/audio/MiniPlayer';
import { WriteScreen } from '@/components/community/WriteScreen';
import { MobileShell } from '@/components/layout/MobileShell';

export default function WritePage() {
  return (
    <MobileShell>
      {/* 노래 만들기에서 넘어온 배경음악(?song=)을 주소에서 읽는다 */}
      <Suspense>
        <WriteScreen />
      </Suspense>
      <MiniPlayer above="bottom" />
    </MobileShell>
  );
}
