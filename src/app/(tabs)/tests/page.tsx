import type { Metadata } from 'next';
import { TestsScreen } from '@/components/tests/TestsScreen';

export const metadata: Metadata = { title: '심리테스트 · 온기' };

export default function TestsPage() {
  return <TestsScreen />;
}
