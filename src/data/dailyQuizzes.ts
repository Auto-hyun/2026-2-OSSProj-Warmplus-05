import type { MoodId } from './moods';

/**
 * 오늘의 마음 날씨 테스트. 날짜마다 하나씩 돌아가며 나온다 (lib/daily.ts).
 * 세트마다 3문항 × 선택지 4개, 7가지 감정이 한 번 이상 나오게 만든다 (data 테스트로 확인).
 * 새 세트는 같은 모양으로 아래에 더하면 된다.
 */
export type DailyQuiz = {
  id: string;
  title: string;
  questions: { text: string; choices: { label: string; mood: MoodId }[] }[];
};

export const DAILY_QUIZZES: readonly DailyQuiz[] = [
  {
    id: 'drink',
    title: '마음 음료',
    questions: [
      {
        text: '지금 마시고 싶은 음료는?',
        choices: [
          { label: '탄산 가득 사이다', mood: 'joy' },
          { label: '따뜻한 캐모마일', mood: 'calm' },
          { label: '아이스 아메리카노 샷 추가', mood: 'tired' },
          { label: '아무것도 안 넘어가', mood: 'anxious' },
        ],
      },
      {
        text: '그 음료를 누구랑 마시고 싶어?',
        choices: [
          { label: '요즘 자꾸 생각나는 그 사람', mood: 'flutter' },
          { label: '혼자 조용히', mood: 'sad' },
          { label: '아무도 없는 곳에서 벌컥벌컥', mood: 'angry' },
          { label: '친한 친구랑 수다 떨면서', mood: 'joy' },
        ],
      },
      {
        text: '다 마시고 나서 하고 싶은 말은?',
        choices: [
          { label: '"좋다~"', mood: 'calm' },
          { label: '"하… 이제 좀 살겠다"', mood: 'tired' },
          { label: '"속이 좀 풀리네"', mood: 'angry' },
          { label: '"그래도 좀 허전해"', mood: 'sad' },
        ],
      },
    ],
  },
  {
    id: 'window',
    title: '창문 너머',
    questions: [
      {
        text: '지금 창문을 열면 들렸으면 하는 소리는?',
        choices: [
          { label: '새 지저귀는 소리', mood: 'joy' },
          { label: '토독토독 빗소리', mood: 'sad' },
          { label: '아무 소리 없는 고요함', mood: 'calm' },
          { label: '천둥 한 번 쾅!', mood: 'angry' },
        ],
      },
      {
        text: '오늘 하루를 사진 한 장으로 남긴다면?',
        choices: [
          { label: '자꾸 흔들린 사진', mood: 'anxious' },
          { label: '반짝이는 노을', mood: 'flutter' },
          { label: '초점 나간 흐릿한 사진', mood: 'tired' },
          { label: '활짝 웃는 셀카', mood: 'joy' },
        ],
      },
      {
        text: '지금 제일 필요한 건?',
        choices: [
          { label: '포근한 이불', mood: 'tired' },
          { label: '누군가의 "괜찮아"', mood: 'anxious' },
          { label: '마음껏 소리 지를 곳', mood: 'angry' },
          { label: '좋아하는 노래 한 곡', mood: 'flutter' },
        ],
      },
    ],
  },
  {
    id: 'road',
    title: '오늘의 길',
    questions: [
      {
        text: '길을 걷다 갈림길이 나왔어. 너는?',
        choices: [
          { label: '아무 데나! 신나게 출발', mood: 'joy' },
          { label: '지도를 몇 번이나 다시 봐', mood: 'anxious' },
          { label: '일단 앉아서 쉬고 싶어', mood: 'tired' },
          { label: '천천히 둘러보며 골라', mood: 'calm' },
        ],
      },
      {
        text: '길 위에서 강아지가 다가왔어.',
        choices: [
          { label: '반가워서 심장이 콩닥', mood: 'flutter' },
          { label: '왠지 울컥해', mood: 'sad' },
          { label: '쓰다듬으며 웃음이 터져', mood: 'joy' },
          { label: '지금은 좀 비켜 줘…', mood: 'angry' },
        ],
      },
      {
        text: '집에 도착했을 때 첫마디는?',
        choices: [
          { label: '"아 다 귀찮아"', mood: 'angry' },
          { label: '"오늘 괜찮았네"', mood: 'calm' },
          { label: '"드디어…"', mood: 'tired' },
          { label: '"내일은 또 어쩌지"', mood: 'anxious' },
        ],
      },
    ],
  },
  {
    id: 'room',
    title: '마음의 방',
    questions: [
      {
        text: '내 마음이 방이라면 지금은?',
        choices: [
          { label: '햇살 드는 깔끔한 방', mood: 'joy' },
          { label: '불 꺼진 조용한 방', mood: 'sad' },
          { label: '물건이 여기저기 어질러진 방', mood: 'anxious' },
          { label: '창문 열린 바람 솔솔 방', mood: 'calm' },
        ],
      },
      {
        text: '그 방에 하나 들이고 싶은 건?',
        choices: [
          { label: '꽃다발', mood: 'flutter' },
          { label: '푹신한 소파', mood: 'tired' },
          { label: '샌드백', mood: 'angry' },
          { label: '작은 화분', mood: 'calm' },
        ],
      },
      {
        text: '누가 방문을 두드린다면?',
        choices: [
          { label: '누구지? 기대돼', mood: 'flutter' },
          { label: '지금은 아무도 안 만나고 싶어', mood: 'sad' },
          { label: '왜 하필 지금!', mood: 'angry' },
          { label: '반가워, 들어와', mood: 'joy' },
        ],
      },
    ],
  },
  {
    id: 'animal',
    title: '오늘의 동물',
    questions: [
      {
        text: '오늘 나를 동물로 표현하면?',
        choices: [
          { label: '꼬리 흔드는 강아지', mood: 'joy' },
          { label: '축 늘어진 나무늘보', mood: 'tired' },
          { label: '털 세운 고양이', mood: 'angry' },
          { label: '굴에 숨은 다람쥐', mood: 'anxious' },
        ],
      },
      {
        text: '그 동물이 지금 하고 싶은 건?',
        choices: [
          { label: '햇볕 쬐며 낮잠', mood: 'calm' },
          { label: '누군가에게 폭 안기기', mood: 'sad' },
          { label: '새 친구 만나기', mood: 'flutter' },
          { label: '실컷 뛰어다니기', mood: 'joy' },
        ],
      },
      {
        text: '그 동물에게 해 주고 싶은 말은?',
        choices: [
          { label: '"오늘도 수고했어"', mood: 'tired' },
          { label: '"무서워하지 않아도 돼"', mood: 'anxious' },
          { label: '"화날 만했어"', mood: 'angry' },
          { label: '"울어도 괜찮아"', mood: 'sad' },
        ],
      },
    ],
  },
  {
    id: 'color',
    title: '마음 물감',
    questions: [
      {
        text: '지금 마음을 색으로 고르면?',
        choices: [
          { label: '노랑', mood: 'joy' },
          { label: '분홍', mood: 'flutter' },
          { label: '연한 하늘색', mood: 'calm' },
          { label: '회색', mood: 'tired' },
        ],
      },
      {
        text: '그 위에 하나 더 그린다면?',
        choices: [
          { label: '파란 물방울', mood: 'sad' },
          { label: '빨간 번개', mood: 'angry' },
          { label: '보라색 소용돌이', mood: 'anxious' },
          { label: '하얀 구름', mood: 'calm' },
        ],
      },
      {
        text: '완성된 그림의 제목은?',
        choices: [
          { label: '「오늘 최고」', mood: 'joy' },
          { label: '「두근두근」', mood: 'flutter' },
          { label: '「조금 지쳤어」', mood: 'tired' },
          { label: '「아직 그리는 중」', mood: 'anxious' },
        ],
      },
    ],
  },
  {
    id: 'music',
    title: '귀에 꽂은 노래',
    questions: [
      {
        text: '지금 듣고 싶은 노래는?',
        choices: [
          { label: '신나는 아이돌 노래', mood: 'joy' },
          { label: '잔잔한 피아노', mood: 'calm' },
          { label: '시원하게 지르는 록', mood: 'angry' },
          { label: '가사가 슬픈 발라드', mood: 'sad' },
        ],
      },
      {
        text: '볼륨은?',
        choices: [
          { label: '최대로!', mood: 'angry' },
          { label: '들릴 듯 말 듯', mood: 'tired' },
          { label: '딱 적당히', mood: 'calm' },
          { label: '자꾸 껐다 켰다', mood: 'anxious' },
        ],
      },
      {
        text: '이 노래를 보내고 싶은 사람은?',
        choices: [
          { label: '요즘 자꾸 생각나는 그 사람', mood: 'flutter' },
          { label: '아무에게도 안 보낼래', mood: 'sad' },
          { label: '단톡방에 바로 공유!', mood: 'joy' },
          { label: '그냥 혼자 듣다 잘래', mood: 'tired' },
        ],
      },
    ],
  },
  {
    id: 'pocket',
    title: '주머니 속',
    questions: [
      {
        text: '주머니에 손을 넣었어. 뭐가 나오면 좋겠어?',
        choices: [
          { label: '잊고 있던 만 원', mood: 'joy' },
          { label: '누군가의 쪽지', mood: 'flutter' },
          { label: '사탕 하나', mood: 'calm' },
          { label: '구겨진 영수증', mood: 'tired' },
        ],
      },
      {
        text: '그걸 보고 든 생각은?',
        choices: [
          { label: '"오 럭키"', mood: 'joy' },
          { label: '"이거 언제 넣었지…?"', mood: 'anxious' },
          { label: '"쳇"', mood: 'angry' },
          { label: '"그때가 그립다"', mood: 'sad' },
        ],
      },
      {
        text: '주머니에서 꺼내 버리고 싶은 건?',
        choices: [
          { label: '걱정 한 뭉치', mood: 'anxious' },
          { label: '쌓인 피곤', mood: 'tired' },
          { label: '꾹 참은 화', mood: 'angry' },
          { label: '아무것도, 지금 딱 좋아', mood: 'calm' },
        ],
      },
    ],
  },
  {
    id: 'cloud',
    title: '구름 위 오목이',
    questions: [
      {
        text: '오목이가 구름 위에서 손짓해. 너는?',
        choices: [
          { label: '바로 뛰어올라!', mood: 'joy' },
          { label: '조심조심 다가가', mood: 'anxious' },
          { label: '아래서 손만 흔들어', mood: 'calm' },
          { label: '오늘은 못 가, 너무 피곤해', mood: 'tired' },
        ],
      },
      {
        text: '구름 위에서 하고 싶은 건?',
        choices: [
          { label: '누워서 하늘 보기', mood: 'calm' },
          { label: '크게 소리 지르기', mood: 'angry' },
          { label: '좋아하는 사람 생각하기', mood: 'flutter' },
          { label: '조용히 울기', mood: 'sad' },
        ],
      },
      {
        text: '내려올 때 들고 오고 싶은 건?',
        choices: [
          { label: '솜사탕 같은 구름 한 조각', mood: 'flutter' },
          { label: '내일을 위한 용기', mood: 'anxious' },
          { label: '머리 식혀 줄 시원한 바람', mood: 'angry' },
          { label: '마음 데워 줄 햇살', mood: 'sad' },
        ],
      },
    ],
  },
  {
    id: 'night',
    title: '하루 마무리',
    questions: [
      {
        text: '오늘 하루에 점수를 매기면?',
        choices: [
          { label: '100점!', mood: 'joy' },
          { label: '70점, 무난했어', mood: 'calm' },
          { label: '40점… 지쳤다', mood: 'tired' },
          { label: '채점 불가, 너무 정신없었어', mood: 'anxious' },
        ],
      },
      {
        text: '오늘 가장 오래 남은 감정은?',
        choices: [
          { label: '설렘', mood: 'flutter' },
          { label: '서운함', mood: 'sad' },
          { label: '짜증', mood: 'angry' },
          { label: '뿌듯함', mood: 'joy' },
        ],
      },
      {
        text: '잠들기 전 나에게 한마디',
        choices: [
          { label: '"내일도 기대된다"', mood: 'flutter' },
          { label: '"괜찮아, 잘 버텼어"', mood: 'sad' },
          { label: '"푹 자자"', mood: 'tired' },
          { label: '"내일은 덜 화내자"', mood: 'angry' },
        ],
      },
    ],
  },
];
