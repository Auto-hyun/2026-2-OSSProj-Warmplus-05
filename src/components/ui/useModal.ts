'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** 지금 열린 모달들 (마지막이 맨 위). 겹쳐 열려도 맨 위 창만 키보드에 반응한다 */
const openModals: object[] = [];
/** 첫 모달이 열리기 전의 body 스크롤 설정 (마지막 모달이 닫힐 때 되돌린다) */
let savedOverflow = '';

/**
 * 모달 공통 동작. 돌려준 ref를 창(tabIndex={-1})에 붙인다.
 * 열리면 창으로 포커스를 옮기고, Tab은 창 안에서만 돌고, ESC로 닫히고, 뒤 화면은 스크롤되지 않는다.
 * 닫히면 열기 전에 있던 자리로 포커스를 돌려준다. 여러 창이 겹치면 맨 위 창만 이렇게 동작한다.
 */
export function useModal<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null);
  // 부모가 다시 그려질 때마다 onClose가 새 함수여도 아래 효과가 다시 돌지 않도록 ref로 최신 값만 참조
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // 열릴 때 한 번만 실행한다 (입력 중 포커스를 빼앗지 않게)
  useEffect(() => {
    if (!open) return;
    const panel = ref.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const self = {};
    if (openModals.length === 0) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    openModals.push(self);
    panel?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (openModals.at(-1) !== self) return;
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      const wasTop = openModals.at(-1) === self;
      openModals.splice(openModals.indexOf(self), 1);
      if (openModals.length === 0) document.body.style.overflow = savedOverflow;
      // 위에 다른 창이 아직 열려 있으면 포커스를 뒤 화면으로 빼앗지 않는다
      if (wasTop) previous?.focus();
    };
  }, [open]);

  return ref;
}
