import Image from 'next/image';
import { FortuneSection } from '@/components/home/FortuneSection';
import { PageHeader } from '@/components/layout/PageHeader';

export default function FortunePage() {
  return (
    <>
      <PageHeader title="오늘의 오하아사" />
      <div className="pb-4">
        <Image src="/village/screens/fortune-hero.webp" alt="" width={882} height={355} preload sizes="480px" className="h-auto w-full" />
        <div className="px-4">
          <h2 className="mt-2 text-center text-[23px] font-bold text-cocoa-900">오늘 나에게 온 작은 행운</h2>
          <p className="mt-1 text-center text-sm text-taupe-500">별자리로 가볍게 만나는 오늘의 이야기.</p>
          <div className="mt-5">
            <FortuneSection />
          </div>
        </div>
      </div>
    </>
  );
}
