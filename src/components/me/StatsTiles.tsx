type Props = { total: number; thisMonth: number; talkedDays: number };

/** 숫자 타일 3개: 누적 미션 / 이번 달 미션 / 얘기한 날 */
export function StatsTiles({ total, thisMonth, talkedDays }: Props) {
  const tiles = [
    { label: '누적 미션', value: `${total}개` },
    { label: '이번 달 미션', value: `${thisMonth}일` },
    { label: '얘기한 날', value: `${talkedDays}일` },
  ];
  return (
    <dl className="grid grid-cols-3 gap-2.5">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-2xl bg-surface px-3 py-3.5 text-center">
          <dt className="text-xs text-ink-400">{tile.label}</dt>
          <dd className="mt-1 text-lg font-bold text-ink-900">{tile.value}</dd>
        </div>
      ))}
    </dl>
  );
}
