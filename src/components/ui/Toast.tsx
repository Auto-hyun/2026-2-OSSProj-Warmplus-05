'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

type ToastItem = { id: number; message: string; tone: 'info' | 'error'; action?: { label: string; href: string } };

let nextId = 1;
const listeners = new Set<(items: ToastItem[]) => void>();
let items: ToastItem[] = [];

function emit(next: ToastItem[]) {
  items = next;
  listeners.forEach((l) => l(items));
}

/** 화면 아래에 잠깐 뜨는 알림. 어디서든 부를 수 있다 */
export function toast(message: string, options: { tone?: ToastItem['tone']; action?: ToastItem['action'] } = {}) {
  const item: ToastItem = { id: nextId++, message, tone: options.tone ?? 'info', action: options.action };
  emit([...items.slice(-2), item]);
  setTimeout(() => emit(items.filter((i) => i.id !== item.id)), options.action ? 5000 : 2800);
}

export function Toaster() {
  const [list, setList] = useState<ToastItem[]>(items);
  useEffect(() => {
    listeners.add(setList);
    return () => {
      listeners.delete(setList);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+12px)] z-50 mx-auto flex max-w-[480px] flex-col items-center gap-2 px-4"
    >
      {list.map((item) => (
        <div
          key={item.id}
          role={item.tone === 'error' ? 'alert' : 'status'}
          className={cn(
            'pointer-events-auto flex w-full animate-[omok-pop_0.2s_ease-out] items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium shadow-[0_8px_24px_rgba(47,43,40,0.18)]',
            item.tone === 'error' ? 'bg-danger text-white' : 'bg-ink-900 text-white',
          )}
        >
          <span className="min-w-0 flex-1">{item.message}</span>
          {item.action && (
            <Link href={item.action.href} className="shrink-0 font-bold text-yellow-500">
              {item.action.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
