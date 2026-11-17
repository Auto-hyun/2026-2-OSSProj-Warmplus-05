'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { track } from '@/lib/events';

/** 화면을 열 때마다 이용 기록(page_view)을 남긴다. 주소만 남기고 ?뒤 값은 담지 않는다 */
export function PageViews() {
  const pathname = usePathname();
  useEffect(() => {
    track('page_view', { path: pathname });
  }, [pathname]);
  return null;
}
