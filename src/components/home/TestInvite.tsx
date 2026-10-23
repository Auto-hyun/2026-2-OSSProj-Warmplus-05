'use client';

import { useState } from 'react';
import { OmokTalk, type TalkReply } from '@/components/omok/OmokTalk';
import { getTest, getTestResult, TESTS } from '@/data/tests';
import { useApp, useStore } from '@/lib/storage/useApp';

/** 가운데 오목이가 한 마디로 심리테스트를 권한다. 이미 했으면 그 유형으로 노래를 만들자고 한다 */
export function TestInvite() {
  const latest = useApp((s) => s.tests[0] ?? null);
  const metOmok = useApp((s) => s.profile.metOmok);
  const store = useStore();
  const [declined, setDeclined] = useState(false);

  if (latest === undefined || metOmok === undefined) return <div className="h-64" />;

  const testHref = `/tests/${TESTS[0].id}`;
  // 대답을 고르면 처음 인사는 끝 (다음부터는 '또 왔구나!')
  const meet = () => store.meetOmok();

  const lastTest = latest && getTest(latest.testId);
  const lastResult = lastTest && getTestResult(lastTest, latest.resultId);

  let line: string;
  let replies: TalkReply[];
  if (lastResult) {
    line = `지난번 결과는 ${lastResult.emoji} ${lastResult.name}! 그 마음으로 노래 만들어 볼까?`;
    replies = [
      { label: '노래 만들기', href: '/create?method=test', primary: true, onSelect: meet },
      { label: '테스트 다시 하기', href: testHref, onSelect: meet },
    ];
  } else if (declined) {
    line = '알겠어! 마음이 바뀌면 불러 줘.';
    replies = [{ label: '역시 해 볼래', href: testHref }];
  } else {
    line = metOmok ? '또 왔구나! 오늘 마음은 어떤 소리일까?' : '안녕, 나는 오목이야! 오늘 마음은 어떤 소리일까?';
    replies = [
      { label: '심리테스트 하기', href: testHref, primary: true, onSelect: meet },
      {
        label: '다음에',
        onSelect: () => {
          meet();
          setDeclined(true);
        },
      },
    ];
  }

  return <OmokTalk line={line} replies={replies} pose="branch" height={120} />;
}
