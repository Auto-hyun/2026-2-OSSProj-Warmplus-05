type Props = {
  /** 0~1 */
  value: number;
  label?: string;
};

export function ProgressBar({ value, label }: Props) {
  const ratio = Math.min(1, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(ratio * 100)}
      className="h-2 w-full overflow-hidden rounded-full bg-line"
    >
      <div className="h-full rounded-full bg-yellow-500 transition-[width] duration-500" style={{ width: `${ratio * 100}%` }} />
    </div>
  );
}
