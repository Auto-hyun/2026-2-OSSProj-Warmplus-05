import type { Icon } from '@phosphor-icons/react';
import { ArrowUpRightIcon, BellSimpleIcon, EnvelopeSimpleIcon, HandHeartIcon } from '@phosphor-icons/react/ssr';
import { LINKS } from '@/data/links';

const ITEMS: { label: string; description: string; href: string; Icon: Icon }[] = [
  { label: '손편지로 고민 보내기', description: '온기우체부가 손편지로 답장해요', href: LINKS.onlineLetter, Icon: EnvelopeSimpleIcon },
  { label: '온기레터 구독하기', description: '익명의 고민과 손편지 답장을 메일로', href: LINKS.subscribe, Icon: BellSimpleIcon },
  { label: '온기 알아보기', description: '단 한 사람도 외롭지 않도록', href: LINKS.about, Icon: HandHeartIcon },
];

/** 온기와 함께하기: 모두 새 탭으로 열린다 */
export function OngiLinks() {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-surface">
      {ITEMS.map(({ label, description, href, Icon }) => (
        <li key={href}>
          <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3.5 active:bg-black/[0.02]">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-yellow-100 text-brown-600">
              <Icon size={20} weight="fill" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium text-ink-900">{label}</span>
              <span className="block truncate text-xs text-ink-400">{description}</span>
            </span>
            <ArrowUpRightIcon size={16} className="shrink-0 text-ink-400" aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}
