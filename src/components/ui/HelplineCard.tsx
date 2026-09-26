import { PhoneIcon } from '@phosphor-icons/react/ssr';
import { HELPLINES } from '@/data/helplines';

/** 마음이 많이 힘들 때 바로 전화할 수 있는 곳 (대화방·나의 온기 공용) */
export function HelplineCard() {
  return (
    <section aria-label="도움받을 수 있는 곳" className="rounded-2xl border border-line bg-surface p-4">
      <h3 className="text-[15px] font-semibold text-ink-900">도움받을 수 있는 곳</h3>
      <p className="mt-0.5 text-xs text-ink-600">누르면 바로 전화가 연결돼요. 혼자 견디지 않아도 괜찮아요.</p>
      <ul className="mt-2 divide-y divide-line">
        {HELPLINES.map((line) => (
          <li key={line.number}>
            <a href={`tel:${line.number.replace(/[^0-9]/g, '')}`} className="flex min-h-12 items-center justify-between gap-3 py-2.5">
              <span>
                <span className="block text-[15px] font-medium text-ink-900">{line.name}</span>
                <span className="block text-xs text-ink-400">{line.note}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-[15px] font-bold text-brown-600">
                <PhoneIcon size={16} weight="fill" aria-hidden />
                {line.number}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
