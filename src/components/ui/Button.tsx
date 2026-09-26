import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-yellow-500 font-semibold text-ink-900 active:brightness-95',
  secondary: 'border border-line bg-surface font-medium text-ink-900 active:bg-black/[0.03]',
  ghost: 'font-medium text-ink-600 active:bg-black/5',
};

const SIZE: Record<Size, string> = {
  md: 'h-11 rounded-2xl px-4 text-[15px]',
  lg: 'h-14 rounded-2xl px-5 text-base',
};

/** 버튼과 버튼처럼 보이는 링크가 같은 모양을 쓰도록 클래스만 따로 제공 */
export function buttonClass(variant: Variant = 'primary', size: Size = 'md', full = false): string {
  return cn(
    'inline-flex items-center justify-center gap-2 transition disabled:pointer-events-none disabled:opacity-40',
    VARIANT[variant],
    SIZE[size],
    full && 'w-full',
  );
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; full?: boolean };

export function Button({ variant = 'primary', size = 'md', full = false, className, type = 'button', ...rest }: Props) {
  return <button type={type} className={cn(buttonClass(variant, size, full), className)} {...rest} />;
}
