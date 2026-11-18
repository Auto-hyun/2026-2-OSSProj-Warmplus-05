'use client';

import { useEffect } from 'react';

/**
 * 이 훅을 쓰는 화면이 떠 있는 동안 문서 전체 스크롤(당겨서 튕기는 것 포함)을 막는다.
 * 홈·지도처럼 휴대폰 한 화면에 고정하는 화면용. 화면을 떠나면 원래대로 돌린다
 */
export function useLockScroll() {
  useEffect(() => {
    const { documentElement: html, body } = document;
    const prev = { html: html.style.overflow, body: body.style.overflow, overscroll: html.style.overscrollBehavior };
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    return () => {
      html.style.overflow = prev.html;
      body.style.overflow = prev.body;
      html.style.overscrollBehavior = prev.overscroll;
    };
  }, []);
}
