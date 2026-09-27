import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MobileShell } from '@/components/layout/MobileShell';
import { TestResultView } from '@/components/tests/TestResultView';
import { TESTS, getTest, getTestResult } from '@/data/tests';

// 결과마다 고정 주소 (공유 링크의 도착지). 목록에 없는 조합은 404
export const dynamicParams = false;

export function generateStaticParams() {
  return TESTS.flatMap((test) => test.results.map((result) => ({ testId: test.id, resultId: result.id })));
}

export async function generateMetadata({ params }: PageProps<'/tests/[testId]/result/[resultId]'>): Promise<Metadata> {
  const { testId, resultId } = await params;
  const test = getTest(testId);
  const result = test && getTestResult(test, resultId);
  if (!test || !result) return {};
  const title = `${test.title}: ${result.name} · 온기`;
  return { title, description: result.summary, openGraph: { title, description: result.summary } };
}

export default async function TestResultPage({ params }: PageProps<'/tests/[testId]/result/[resultId]'>) {
  const { testId, resultId } = await params;
  const test = getTest(testId);
  if (!test || !getTestResult(test, resultId)) notFound();
  return (
    <MobileShell>
      <TestResultView testId={testId} resultId={resultId} />
    </MobileShell>
  );
}
