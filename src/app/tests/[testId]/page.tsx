import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MobileShell } from '@/components/layout/MobileShell';
import { TestRunner } from '@/components/tests/TestRunner';
import { TESTS, getTest } from '@/data/tests';

// 목록에 있는 테스트만 미리 만들고, 그 밖의 id는 404
export const dynamicParams = false;

export function generateStaticParams() {
  return TESTS.map((test) => ({ testId: test.id }));
}

export async function generateMetadata({ params }: PageProps<'/tests/[testId]'>): Promise<Metadata> {
  const { testId } = await params;
  const test = getTest(testId);
  return test ? { title: `${test.title} · 온기`, description: test.subtitle } : {};
}

/** 테스트 진행 (탭 바 없이 전체 화면). 공유 링크로 처음 온 사람도 이름 짓기 없이 바로 해볼 수 있다 */
export default async function TestPage({ params }: PageProps<'/tests/[testId]'>) {
  const { testId } = await params;
  if (!getTest(testId)) notFound();
  return (
    <MobileShell>
      <TestRunner testId={testId} />
    </MobileShell>
  );
}
