import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LettersScreen } from '@/components/letters/LettersScreen';

export const metadata: Metadata = { title: '온기레터 · 온기' };

export default function LettersPage() {
  return (
    <Suspense fallback={null}>
      <LettersScreen />
    </Suspense>
  );
}
