import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-yellow-500 text-ink-900 active:brightness-95 disabled:bg-line disabled:text-ink-400',
  secondary: 'border border-line bg-surface text-ink-900 active:bg-black/5 disabled:text-ink-400',
  ghost: 'text-ink-600 active:bg-black/5 disabled:text-ink-400',
};

const BASE = 'inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-[15px] font-bold transition-colors';

type Props = { variant?: Variant; children: ReactNode; className?: string };

export function Button({ variant = 'primary', className, children, ...rest }: Props & ComponentProps<'button'>) {
  return (
    <button type="button" className={cn(BASE, VARIANTS[variant], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({ variant = 'primary', className, children, ...rest }: Props & ComponentProps<typeof Link>) {
  return (
    <Link className={cn(BASE, VARIANTS[variant], className)} {...rest}>
      {children}
    </Link>
  );
}
