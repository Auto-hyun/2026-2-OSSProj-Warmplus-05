import { MobileShell } from '@/components/layout/MobileShell';
import { Omok } from '@/components/omok/Omok';
import { ButtonLink } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <MobileShell>
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <Omok pose="search" height={110} eager />
        <h1 className="mt-6 text-xl font-bold">찾는 화면이 없어요</h1>
        <p className="mt-2 text-ink-600">주소가 바뀌었거나 사라진 화면이에요.</p>
        <ButtonLink href="/" className="mt-8 w-full">
          오목이에게 돌아가기
        </ButtonLink>
      </div>
    </MobileShell>
  );
}
