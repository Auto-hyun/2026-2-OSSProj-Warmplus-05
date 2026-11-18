import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-leaf-600 text-white active:brightness-95 disabled:bg-cream-line disabled:text-taupe-500',
  secondary: 'border border-cream-line bg-surface text-cocoa-900 active:bg-black/5 disabled:text-taupe-500',
  ghost: 'text-taupe-500 active:bg-black/5 disabled:text-taupe-500',
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
