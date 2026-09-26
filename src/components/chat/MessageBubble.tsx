import { Mascot } from '@/components/mascot/Mascot';
import type { StageNo } from '@/data/stages';
import type { ChatRole } from '@/lib/storage/types';

function TypingDots() {
  return (
    <span role="status" aria-label="뱁새가 답장을 쓰는 중" className="inline-flex h-5 items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-[ongi-dot_1.2s_ease-in-out_infinite] rounded-full bg-ink-400"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

/** 원형 프로필: 단계마다 새의 위치가 달라 얼굴 쪽을 확대해 보여준다 */
function Avatar({ stage }: { stage: StageNo }) {
  return (
    <div aria-hidden className="size-9 shrink-0 overflow-hidden rounded-full bg-yellow-100">
      <div
        className="size-10 -translate-x-0.5 -translate-y-0.5"
        style={{ transform: `scale(${stage === 1 ? 1.9 : 1.45})`, transformOrigin: stage === 1 ? '50% 76%' : '50% 52%' }}
      >
        <Mascot stage={stage} size="sm" animated={false} decorative />
      </div>
    </div>
  );
}

type Props = {
  role: ChatRole;
  content: string;
  /** 답장을 받는 중 (내용이 비어 있으면 점 세 개) */
  pending?: boolean;
  avatarStage?: StageNo;
};

export function MessageBubble({ role, content, pending = false, avatarStage = 1 }: Props) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[78%] rounded-2xl rounded-br-md bg-yellow-100 px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap text-ink-900">
          {content}
        </p>
      </div>
    );
  }
  return (
    <div className="flex items-end gap-2">
      <Avatar stage={avatarStage} />
      <p className="max-w-[78%] rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap text-ink-900">
        {pending && !content ? <TypingDots /> : content}
      </p>
    </div>
  );
}
