import { notFound } from 'next/navigation';
import { MobileShell } from '@/components/layout/MobileShell';
import { DebugScreen } from '@/components/debug/DebugScreen';

/** 개발할 때만 여는 저장 기록 확인 화면 (배포본에서는 404) */
export default function DebugPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <MobileShell>
      <DebugScreen />
    </MobileShell>
  );
}
