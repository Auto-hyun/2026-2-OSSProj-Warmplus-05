import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { MobileShell } from '@/components/layout/MobileShell';
import { TestScreen } from '@/components/tests/TestScreen';
import { getTest, TESTS } from '@/data/tests';

export function generateStaticParams() {
  return TESTS.map((t) => ({ testId: t.id }));
}

export default function TestPage({ params }: PageProps<'/tests/[testId]'>) {
  return (
    <MobileShell>
      {/* 주소 속 값(테스트 id, 결과 다시 보기 ?result=)은 Suspense 안에서 읽어야 화면이 바로 뜬다 */}
      <Suspense>
        <TestLoader params={params} />
      </Suspense>
    </MobileShell>
  );
}

async function TestLoader({ params }: { params: PageProps<'/tests/[testId]'>['params'] }) {
  const { testId } = await params;
  if (!getTest(testId)) notFound();
  return <TestScreen testId={testId} />;
}
