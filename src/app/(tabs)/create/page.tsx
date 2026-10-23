import { Suspense } from 'react';
import { CreateScreen } from '@/components/create/CreateScreen';

export default function CreatePage() {
  return (
    // 결과 화면에서 넘어온 방법·유형(?method=test&test=&result=)을 주소에서 읽는다
    <Suspense>
      <CreateScreen />
    </Suspense>
  );
}
