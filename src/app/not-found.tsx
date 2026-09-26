import Link from 'next/link';
import { MobileShell } from '@/components/layout/MobileShell';
import { Mascot } from '@/components/mascot/Mascot';
import { buttonClass } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <MobileShell>
      <main className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
        <Mascot stage={1} size="md" />
        <h1 className="mt-4 text-xl font-bold text-ink-900">페이지를 찾을 수 없어요</h1>
        <p className="mt-2 text-sm text-ink-600">주소가 바뀌었거나 사라진 페이지예요.</p>
        <Link href="/" className={`${buttonClass('primary', 'lg')} mt-8 px-8`}>
          홈으로 가기
        </Link>
      </main>
    </MobileShell>
  );
}
