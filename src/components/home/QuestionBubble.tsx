/** 오목이가 건네는 오늘의 질문 (아래 꼬리가 마스코트를 가리키는 말풍선) */
export function QuestionBubble({ question }: { question: string }) {
  return (
    <div className="relative w-full max-w-[320px] rounded-3xl bg-surface px-5 py-4 text-center shadow-[0_6px_20px_rgba(47,43,40,0.08)]">
      <p className="text-xs font-semibold text-brown-600">오늘의 질문</p>
      <p className="mt-1 text-[17px] leading-snug font-semibold text-ink-900">{question}</p>
      <span aria-hidden className="absolute -bottom-1.5 left-1/2 size-4 -translate-x-1/2 rotate-45 rounded-[3px] bg-surface" />
    </div>
  );
}
