import type { Metadata } from 'next';
import { MissionScreen } from '@/components/mission/MissionScreen';

export const metadata: Metadata = { title: '미션 · 온기' };

export default function MissionPage() {
  return <MissionScreen />;
}
