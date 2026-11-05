import { Suspense } from 'react';
import { CommunityScreen } from '@/components/community/CommunityScreen';

export default function CommunityPage() {
  return (
    // 게시판 탭(?board=free)을 주소에서 읽는다
    <Suspense>
      <CommunityScreen />
    </Suspense>
  );
}
