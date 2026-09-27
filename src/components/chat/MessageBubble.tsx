import { Mascot } from '@/components/mascot/Mascot';
import { getStage, type StageNo } from '@/data/stages';
import { josa } from '@/lib/josa';
import { DEFAULT_BIRD_NAME } from '@/lib/storage/adapters';
import type { ChatRole } from '@/lib/storage/types';

function TypingDots({ name }: { name: string }) {
  return (
    <span role="status" aria-label={`${josa(name, '이/가')} 답장을 쓰는 중`} className="inline-flex h-5 items-center gap-1">
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

const AVATAR_SCALE = 1.8;

/** 원형 프로필: 단계마다 얼굴 위치가 달라, 얼굴 중심을 동그라미 가운데로 옮겨 확대해 보여준다 */
function Avatar({ stage }: { stage: StageNo }) {
  const { x, y } = getStage(stage).face;
  return (
    <div aria-hidden className="size-9 shrink-0 overflow-hidden rounded-full bg-yellow-100">
      <div
        className="size-10 -translate-x-0.5 -translate-y-0.5"
        style={{ transformOrigin: `${x}% ${y}%`, transform: `translate(${50 - x}%, ${50 - y}%) scale(${AVATAR_SCALE})` }}
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
  /** 지은 이름 (답장을 쓰는 중이라고 알릴 때) */
  name?: string;
};

export function MessageBubble({ role, content, pending = false, avatarStage = 1, name = DEFAULT_BIRD_NAME }: Props) {
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
        {pending && !content ? <TypingDots name={name} /> : content}
      </p>
    </div>
  );
}
