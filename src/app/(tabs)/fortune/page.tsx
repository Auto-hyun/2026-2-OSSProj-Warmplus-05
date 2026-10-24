import { FortuneSection } from '@/components/home/FortuneSection';
import { AppBar } from '@/components/layout/AppBar';

export default function FortunePage() {
  return (
    <>
      <AppBar title="오늘의 오하아사" />
      <div className="px-4 pt-2">
        <FortuneSection />
      </div>
    </>
  );
}
