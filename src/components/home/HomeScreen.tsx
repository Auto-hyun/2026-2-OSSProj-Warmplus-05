'use client';

import { FortuneSection } from './FortuneSection';
import { OmokRoom } from './OmokRoom';

/** 홈: 오목이 집(2.5D 장면) 아래로 오하아사 */
export function HomeScreen() {
  return (
    <>
      <OmokRoom />
      <div className="px-4 pt-5">
        <FortuneSection />
      </div>
    </>
  );
}
