import type { Metadata } from 'next';
import { MeScreen } from '@/components/me/MeScreen';

export const metadata: Metadata = { title: '나의 온기 · 온기' };

export default function MePage() {
  return <MeScreen />;
}
