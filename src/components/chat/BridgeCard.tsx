import { ArrowUpRightIcon, EnvelopeSimpleIcon } from '@phosphor-icons/react/ssr';
import { buttonClass } from '@/components/ui/Button';
import { LINKS } from '@/data/links';
import { cn } from '@/lib/cn';

/** 대화가 이어지면 한 번, 진짜 손편지 답장을 받을 수 있는 온기우편함으로 이어준다 */
export function BridgeCard() {
  return (
    <aside aria-label="온기우편함 안내" className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-yellow-100 text-brown-600">
          <EnvelopeSimpleIcon size={22} weight="fill" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-ink-900">이 이야기, 손편지로 답장받고 싶다면?</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-600">
            온기우편함에 익명으로 고민편지를 보내면, 온기우체부가 손편지로 답장을 전해드려요.
          </p>
        </div>
      </div>
      <a href={LINKS.onlineLetter} target="_blank" rel="noopener noreferrer" className={cn(buttonClass('secondary', 'md', true), 'mt-3')}>
        고민편지 보내러 가기
        <ArrowUpRightIcon size={16} aria-hidden />
      </a>
    </aside>
  );
}
