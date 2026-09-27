import { InfoIcon } from '@phosphor-icons/react/ssr';

/** 처음 대화방에 들어왔을 때 한 번 보여주는 안내 */
export function ChatNotice({ onClose }: { onClose: () => void }) {
  return (
    <div role="note" className="flex items-start gap-2.5 rounded-2xl bg-yellow-100/70 p-3.5">
      <InfoIcon size={18} weight="fill" className="mt-0.5 shrink-0 text-brown-600" aria-hidden />
      <p className="flex-1 text-[13px] leading-relaxed text-ink-600">
        오목이는 전문 상담사가 아니에요. 마음이 많이 힘들 땐 전문가의 도움을 받아주세요.
      </p>
      <button type="button" onClick={onClose} className="-my-3 -mr-1 min-h-11 shrink-0 px-1 text-[13px] font-semibold text-brown-600">
        알겠어요
      </button>
    </div>
  );
}
