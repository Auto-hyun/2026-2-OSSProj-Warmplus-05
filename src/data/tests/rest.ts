// B그룹: 휴식·에너지 테스트 모음 — 공통 축은 휴식 4유형(a 고요형 / b 환기형 / c 몰입형 / d 함께형)
import type { PsychTest } from '../tests';

export const REST_TESTS: readonly PsychTest[] = [
  {
    id: 'my-rest',
    title: '내 마음에 필요한 휴식',
    subtitle: '쉬었는데도 피곤하다면, 쉬는 방법이 안 맞는 걸지도',
    emoji: '🛋️',
    minutes: 2,
    tag: '나를 돌아보기',
    category: 'reflect',
    thumb: '/village/screens/test-2.webp',
    questions: [
      {
        text: '드디어 아무 일정 없는 주말 아침. 눈 뜨자마자 하고 싶은 건?',
        choices: [
          { label: '커튼 닫고 이불 속에서 꼼짝도 안 하기', type: 'a' },
          { label: '날씨 확인하고 나갈 채비', type: 'b' },
          { label: '밀린 드라마·웹툰·책 정주행 시작', type: 'c' },
          { label: '친구들 단톡에 "오늘 뭐 해?" 던지기', type: 'd' },
        ],
      },
      {
        text: '요즘 많이 지쳤다. 제일 당기는 건?',
        choices: [
          { label: '혼자만의 조용한 시간', type: 'a' },
          { label: '탁 트인 데서 바람 쐬기', type: 'b' },
          { label: '현실 잊게 해주는 재밌는 이야기', type: 'c' },
          { label: '좋아하는 사람들과 맛있는 밥', type: 'd' },
        ],
      },
      {
        text: '쉬는 중에 누가 갑자기 "뭐 해?" 하고 연락 오면?',
        choices: [
          { label: '읽고 잠시 둔다. 지금은 충전 중', type: 'a' },
          { label: '"나 산책 중! 너도 나올래?"', type: 'b' },
          { label: '보던 거 마저 보고 몰아서 답장', type: 'c' },
          { label: '바로 통화 버튼 누른다', type: 'd' },
        ],
      },
      {
        text: '여행을 간다면 제일 기대되는 순간은?',
        choices: [
          { label: '숙소에서 아무것도 안 하고 뒹굴기', type: 'a' },
          { label: '낯선 길을 걷다 우연히 발견하는 풍경', type: 'b' },
          { label: '이동하면서 노래 듣고 창밖 보며 생각 정리', type: 'c' },
          { label: '같이 간 사람들과 밤새 떠드는 시간', type: 'd' },
        ],
      },
      {
        text: '"아 잘 쉬었다" 싶었던 날을 떠올려 보면?',
        choices: [
          { label: '하루 종일 말 한마디 안 한 날', type: 'a' },
          { label: '몸을 움직여서 오히려 개운해진 날', type: 'b' },
          { label: '좋은 이야기(영화·책·음악)에 푹 빠졌던 날', type: 'c' },
          { label: '실컷 웃고 떠들다 돌아온 날', type: 'd' },
        ],
      },
      {
        text: '내일 하루가 통째로 비었다. 지금 기분은?',
        choices: [
          { label: '드디어 아무도 안 만나도 된다', type: 'a' },
          { label: '어디 갈지 지도부터 켠다', type: 'b' },
          { label: '아껴둔 거 볼 생각에 설렌다', type: 'c' },
          { label: '누구 부를지 머릿속 명단 가동', type: 'd' },
        ],
      },
    ],
    results: [
      {
        id: 'a',
        name: '고요한 방',
        emoji: '🕯️',
        summary: '자극을 끄고 혼자 고요히 있어야 충전되는 타입',
        description:
          '너한테 필요한 건 자극이 아니라 고요야. 알림을 끄고 혼자만의 방으로 들어가자. 오늘의 처방: 잔잔한 노래 한 곡과 아무것도 안 할 자유.',
        music: { family: 'calm', style: 'candlelight room, slow breathing piano' },
      },
      {
        id: 'b',
        name: '바람 쐬는 산책',
        emoji: '🍃',
        summary: '멈추기보다 움직이면서 비워내야 쉬어지는 타입',
        description:
          '너는 멈춰서 쉬는 것보다 움직이면서 비워내는 쪽이야. 창문을 열거나 한 바퀴 걷고 오자. 오늘의 처방: 걸음에 맞는 노래 한 곡.',
        music: { family: 'stress', style: 'open field wind, light footsteps beat' },
      },
      {
        id: 'c',
        name: '이야기 속으로',
        emoji: '📖',
        summary: '좋아하는 이야기에 푹 빠졌다 오는 게 휴식인 타입',
        description:
          '너는 다른 이야기에 잠깐 다녀오는 게 휴식이야. 좋아하는 세계에 푹 빠졌다 오자. 오늘의 처방: 감상에 어울리는 노래 한 곡.',
        music: { family: 'sad', style: 'page turning, nostalgic strings' },
      },
      {
        id: 'd',
        name: '같이 있는 저녁',
        emoji: '🍲',
        summary: '혼자보다 함께 있을 때 충전되는 타입',
        description:
          '너는 혼자보다 함께일 때 충전되는 사람이야. 보고 싶던 얼굴에게 먼저 연락해 보자. 오늘의 처방: 따뜻한 노래 한 곡.',
        music: { family: 'happy', style: 'warm kitchen, humming melody' },
      },
    ],
  },
  {
    id: 'my-charging',
    title: '나의 충전 방식',
    subtitle: '방전된 나, 어디에 꽂아야 충전이 될까?',
    emoji: '🔋',
    minutes: 2,
    tag: '가벼운 테스트',
    category: 'light',
    thumb: '/village/screens/test-0.webp',
    questions: [
      {
        text: '배터리 10% 상태로 집에 도착했다. 제일 먼저 하는 건?',
        choices: [
          { label: '단톡 열어서 오늘 있었던 일 풀기', type: 'd' },
          { label: '침대에 눕고 폰은 손 안 닿는 데로', type: 'a' },
          { label: '미뤄둔 영상 바로 재생', type: 'c' },
          { label: '일단 샤워부터 쫙', type: 'b' },
        ],
      },
      {
        text: '내 배터리가 제일 빨리 닳는 순간은?',
        choices: [
          { label: '하루 종일 한자리에 앉아만 있을 때', type: 'b' },
          { label: '사람 많고 시끄러운 데 오래 있을 때', type: 'a' },
          { label: '하루 종일 혼자였을 때', type: 'd' },
          { label: '좋아하는 거 할 틈이 하나도 없을 때', type: 'c' },
        ],
      },
      {
        text: '나한테 맞는 충전기를 하나 고른다면?',
        choices: [
          { label: '음악 나오는 스피커 겸용 충전기', type: 'c' },
          { label: '여럿이 같이 꽂는 멀티탭', type: 'd' },
          { label: '걸을 때마다 충전되는 자가발전기', type: 'b' },
          { label: '조용한 방구석의 무선 충전 패드', type: 'a' },
        ],
      },
      {
        text: '주말 하루를 통째로 충전에 쓸 수 있다면?',
        choices: [
          { label: '밖에 나가서 실컷 걷다 오기', type: 'b' },
          { label: '폰 엎어두고 하루 종일 뒹굴기', type: 'a' },
          { label: '사람들 만나서 떠들썩하게 보내기', type: 'd' },
          { label: '드라마든 책이든 하나 잡고 끝까지', type: 'c' },
        ],
      },
      {
        text: '충전 중인데 연락이 울리면?',
        choices: [
          { label: '오히려 반갑다. 바로 받는다', type: 'd' },
          { label: '지금은 충전 중. 나중에 몰아서 답장', type: 'a' },
          { label: '보던 거 끊기는 게 제일 싫다', type: 'c' },
          { label: '어차피 나가려던 참이라 "같이 걸을래?"', type: 'b' },
        ],
      },
      {
        text: '"오늘 완충됐다" 싶었던 날을 떠올려 보면?',
        choices: [
          { label: '몸을 움직여서 땀 좀 뺀 날', type: 'b' },
          { label: '실컷 웃고 떠들다 온 날', type: 'd' },
          { label: '아무도 안 만나고 조용히 보낸 날', type: 'a' },
          { label: '좋은 거에 푹 빠져서 시간 가는 줄 몰랐던 날', type: 'c' },
        ],
      },
    ],
    results: [
      {
        id: 'a',
        name: '비행기 모드 충전',
        emoji: '✈️',
        summary: '알림 꺼진 조용한 시간이 제일 빠른 충전기인 타입',
        description:
          '너는 비행기 모드로 충전되는 타입이야. 알림이 꺼진 조용한 시간이 제일 빠른 충전기구나. 충전되는 동안 틀어둘 잔잔한 노래 한 곡 만들어 보자.',
        music: { family: 'calm', style: 'airplane mode silence, slow breathing pads' },
      },
      {
        id: 'b',
        name: '자가발전 충전',
        emoji: '🚶',
        summary: '가만히 있기보다 움직여야 충전되는 자가발전형',
        description:
          '너는 가만히 꽂혀 있는 것보다 움직여야 충전되는 자가발전형이야. 한 바퀴 걷고 오면 게이지가 차오르지. 걸음에 맞는 노래 한 곡이면 충전 속도가 더 빨라질 거야.',
        music: { family: 'stress', style: 'wind-up dynamo, brisk walking beat' },
      },
      {
        id: 'c',
        name: '이야기 속 충전',
        emoji: '📖',
        summary: '좋아하는 것에 푹 잠겨 있는 동안 충전되는 타입',
        description:
          '너는 좋아하는 것에 빠져 있는 동안 충전되는 타입이야. 이야기든 음악이든 하나에 푹 잠겼다 나오면 돼. 오늘은 네가 잠길 노래를 직접 만들어 보자.',
        music: { family: 'sad', style: 'headphones on, immersive mellow strings' },
      },
      {
        id: 'd',
        name: '멀티탭 충전',
        emoji: '🔌',
        summary: '사람들 틈에서 같이 꽂혀 있을 때 충전되는 타입',
        description:
          '너는 혼자 꽂혀 있으면 오히려 안 차는 멀티탭 타입이야. 사람들 틈에서 같이 꽂혀 있을 때 충전되는구나. 같이 듣고 싶어지는 노래 한 곡 만들어 보자.',
        music: { family: 'happy', style: 'power strip full of plugs, bright shared melody' },
      },
    ],
  },
  {
    id: 'after-school',
    title: '하교 후 나의 모습',
    subtitle: '오늘 하루 끝, 나는 어느 길로 집에 갈까?',
    emoji: '🎒',
    minutes: 2,
    tag: '가벼운 테스트',
    category: 'light',
    thumb: '/village/screens/test-1.webp',
    questions: [
      {
        text: '마지막 수업 끝나는 종이 울렸다. 머릿속에 드는 생각은?',
        choices: [
          { label: '오늘 누구랑 저녁 먹지?', type: 'd' },
          { label: '드디어 집. 최단 루트로 간다', type: 'a' },
          { label: '아 바람 좀 쐬고 싶다', type: 'b' },
          { label: '아껴둔 다음 화 볼 생각에 벌써 신남', type: 'c' },
        ],
      },
      {
        text: '집에 가는 버스·지하철 안에서 나는?',
        choices: [
          { label: '이어폰 끼는 순간부터 내 세상', type: 'c' },
          { label: '창밖 보면서 아무 생각 안 하기', type: 'a' },
          { label: '친구들이랑 톡으로 계속 수다', type: 'd' },
          { label: '답답해서 한 정거장 먼저 내릴까 고민', type: 'b' },
        ],
      },
      {
        text: '가는 길에 저녁을 해결한다면?',
        choices: [
          { label: '좋아하는 노래 들으면서 혼밥, 나쁘지 않음', type: 'c' },
          { label: '포장해 가서 집에서 편하게', type: 'a' },
          { label: '누구든 불러서 같이 먹어야 밥이지', type: 'd' },
          { label: '좀 걸어야 하는 맛집까지 걸어가서', type: 'b' },
        ],
      },
      {
        text: '같은 방향 친구가 "뭐 하고 갈래?" 하면?',
        choices: [
          { label: '"콜. 뭐 먹을지부터 정하자"', type: 'd' },
          { label: '"미안, 오늘은 집에서 쉬고 싶어"', type: 'a' },
          { label: '"그럼 좀 걷다 갈래? 날씨 좋잖아"', type: 'b' },
          { label: '"나 오늘 보던 거 마저 봐야 해서..."', type: 'c' },
        ],
      },
      {
        text: '현관문 열고 들어가서 제일 먼저 하는 건?',
        choices: [
          { label: '씻고 바로 스트레칭이나 운동', type: 'b' },
          { label: '가방 던지고 침대로 다이빙', type: 'a' },
          { label: '노트북 켜고 보던 거 이어서 재생', type: 'c' },
          { label: '가족이든 룸메든 붙잡고 오늘 썰 풀기', type: 'd' },
        ],
      },
      {
        text: '오늘 저녁이 완벽해지려면 뭐가 필요해?',
        choices: [
          { label: '아무도 나를 안 찾는 조용한 몇 시간', type: 'a' },
          { label: '야식 시켜놓고 모이는 사람들', type: 'd' },
          { label: '밤공기 마시면서 걷는 동네 한 바퀴', type: 'b' },
          { label: '끊을 수 없게 재밌는 다음 화', type: 'c' },
        ],
      },
    ],
    results: [
      {
        id: 'a',
        name: '집 직행 코스',
        emoji: '🏠',
        summary: '최단 루트로 돌아와 혼자 조용히 하루를 닫는 저녁',
        description:
          '하루 끝의 너는 집 직행 코스. 최단 루트로 돌아와 혼자 조용히 하루를 닫는 게 너의 저녁이구나. 불 끄고 틀어둘 잔잔한 노래 한 곡 만들자.',
        music: { family: 'calm', style: 'lights off my room, quiet unwinding piano' },
      },
      {
        id: 'b',
        name: '한 정거장 산책 코스',
        emoji: '🚏',
        summary: '한 정거장 먼저 내려 걸으며 하루를 흘려보내는 저녁',
        description:
          '하루 끝의 너는 한 정거장 먼저 내리는 사람. 걸으면서 하루에 쌓인 걸 바람에 흘려보내는 중이야. 저녁 산책에 맞는 노래 한 곡 어때.',
        music: { family: 'stress', style: 'getting off one stop early, evening breeze beat' },
      },
      {
        id: 'c',
        name: '이어폰 월드 코스',
        emoji: '🎧',
        summary: '이어폰을 끼는 순간부터 진짜 퇴근이 시작되는 저녁',
        description:
          '하루 끝의 너는 이어폰 월드행. 이어폰을 끼는 순간부터가 진짜 퇴근이지. 오늘의 하굣길 플레이리스트에 들어갈 노래를 직접 만들어 보자.',
        music: { family: 'sad', style: 'bus window view, cinematic warm strings' },
      },
      {
        id: 'd',
        name: '저녁 번개 코스',
        emoji: '🍜',
        summary: '하루 얘기 나눌 사람이 있어야 하루가 끝나는 저녁',
        description:
          '하루 끝의 너는 저녁 번개 코스. 하루 얘기를 나눌 사람이 있어야 하루가 끝나는 타입이구나. 같이 먹는 저녁처럼 따뜻한 노래 한 곡 만들어 보자.',
        music: { family: 'happy', style: 'dinner with friends, clinking cozy tune' },
      },
    ],
  },
  {
    id: 'energy-gauge',
    title: '내 에너지 잔량 테스트',
    subtitle: '게이지가 깎일 때, 나는 뭘로 다시 채우고 있을까?',
    emoji: '⛽',
    minutes: 2,
    tag: '나를 돌아보기',
    category: 'reflect',
    thumb: '/village/screens/test-2.webp',
    questions: [
      {
        text: '요즘 내 게이지가 제일 빨리 깎이는 건 언제야?',
        choices: [
          { label: '내 시간 없이 일정만 돌아갈 때', type: 'c' },
          { label: '계속 누군가를 상대해야 할 때', type: 'a' },
          { label: '종일 실내에 갇혀 있을 때', type: 'b' },
          { label: '하루 종일 말할 사람이 없을 때', type: 'd' },
        ],
      },
      {
        text: '게이지 20% 경고가 뜨면 나는?',
        choices: [
          { label: '일단 밖에 나가서 공기부터 바꾼다', type: 'b' },
          { label: '약속을 비우고 혼자만의 시간을 확보한다', type: 'a' },
          { label: '친구한테 "나 좀 살려줘" 하고 연락한다', type: 'd' },
          { label: '좋아하는 노래나 영상에 잠수 탄다', type: 'c' },
        ],
      },
      {
        text: '에너지가 조금씩 차는 게 느껴지는 순간은?',
        choices: [
          { label: '조용한 방에서 아무것도 안 할 때', type: 'a' },
          { label: '몸 움직이고 나서 개운할 때', type: 'b' },
          { label: '이야기 하나에 푹 빠져 있을 때', type: 'c' },
          { label: '좋아하는 사람들이랑 웃고 있을 때', type: 'd' },
        ],
      },
      {
        text: '최근에 게이지 100%였던 날, 그날 나는 뭘 했지?',
        choices: [
          { label: '신나게 수다 떨고 늦게까지 놀았다', type: 'd' },
          { label: '쌓아둔 드라마·책을 하루 종일 달렸다', type: 'c' },
          { label: '멀리까지 걷거나 어디론가 다녀왔다', type: 'b' },
          { label: '집에서 아무 약속 없이 뒹굴었다', type: 'a' },
        ],
      },
      {
        text: '에너지 아끼려고 쓰는 나만의 꼼수가 있다면?',
        choices: [
          { label: '이동 시간엔 무조건 이어폰, 나만의 결계', type: 'c' },
          { label: '중간중간 바람 쐬러 나갔다 오기', type: 'b' },
          { label: '점심이라도 좋아하는 사람이랑 먹기', type: 'd' },
          { label: '일정 사이에 혼자 있는 틈 몰래 끼워 넣기', type: 'a' },
        ],
      },
      {
        text: '지금 당장 게이지를 10% 올려준다면, 뭘로 올리고 싶어?',
        choices: [
          { label: '지금 떠오르는 그 사람과의 통화', type: 'd' },
          { label: '창문 활짝 열고 들어오는 바람', type: 'b' },
          { label: '모두에게서 잠깐 로그아웃', type: 'a' },
          { label: '몰입할 수 있는 좋은 이야기 하나', type: 'c' },
        ],
      },
    ],
    results: [
      {
        id: 'a',
        name: '조용한 갓길 정차',
        emoji: '🅿️',
        summary: '게이지가 떨어지면 갓길에 차를 세우고 혼자 쉬는 타입',
        description:
          '너는 게이지가 떨어지면 조용한 갓길에 차를 세우는 타입이야. 혼자 있는 틈이 너의 쉼터구나. 시동 끄고 들을 낮은 볼륨의 노래 한 곡 만들어 두자.',
        music: { family: 'calm', style: 'engine off roadside rest, minimal soft keys' },
      },
      {
        id: 'b',
        name: '창문 활짝 드라이브',
        emoji: '🚗',
        summary: '창문 열고 달리며 공기를 바꿔야 게이지가 차는 타입',
        description:
          '너는 멈춰서 쉬는 것보다 창문 열고 달려야 게이지가 차는 타입이야. 공기를 바꾸면 열이 식지. 바람 드는 드라이브에 어울리는 노래 한 곡 틀어보자.',
        music: { family: 'stress', style: 'windows down highway breeze, fresh air groove' },
      },
      {
        id: 'c',
        name: '라디오 켠 밤 주행',
        emoji: '📻',
        summary: '이야기와 음악 속으로 잠깐 다녀오며 회복하는 타입',
        description:
          '너는 라디오 켜고 밤길을 달리는 타입이야. 이야기와 음악 속으로 잠깐 다녀오는 게 너의 회복법이구나. 오늘의 심야 라디오에 깔릴 노래를 만들어 보자.',
        music: { family: 'sad', style: 'night drive radio, slow immersive waves' },
      },
      {
        id: 'd',
        name: '휴게소 수다 충전',
        emoji: '☕',
        summary: '사람들과 쉬어갈 때 게이지가 차는 타입',
        description:
          '너는 휴게소에서 충전되는 타입이야. 혼자 달리기만 하면 금방 지치고, 사람들과 쉬어갈 때 게이지가 차지. 같이 나눠 듣고 싶은 노래 한 곡 만들어 보자.',
        music: { family: 'happy', style: 'rest stop chatter, upbeat duet melody' },
      },
    ],
  },
  {
    id: 'sudden-vacation',
    title: '방학이 생긴다면',
    subtitle: '내일부터 갑자기 일주일 방학. 뭐부터 할 거야?',
    emoji: '🏖️',
    minutes: 2,
    tag: '가벼운 테스트',
    category: 'light',
    thumb: '/village/screens/test-0.webp',
    questions: [
      {
        text: '"내일부터 일주일 방학"이라는 공지를 봤다. 첫 반응은?',
        choices: [
          { label: '단톡에 바로 공유. "우리 언제 모여?"', type: 'd' },
          { label: '기차표 검색부터', type: 'b' },
          { label: '드디어 아무것도 안 해도 된다', type: 'a' },
          { label: '아껴둔 시리즈 정주행 각', type: 'c' },
        ],
      },
      {
        text: '방학 첫날 아침, 눈 뜨자마자 하는 건?',
        choices: [
          { label: '알람 끄고 당당하게 다시 잔다', type: 'a' },
          { label: '날씨 보고 어디 갈지 정한다', type: 'b' },
          { label: '누워서 바로 1화 재생', type: 'c' },
          { label: '"오늘 시간 되는 사람?" 하고 투표 올리기', type: 'd' },
        ],
      },
      {
        text: '일주일 계획표를 짠다면 어떤 모양일까?',
        choices: [
          { label: '어디론가 떠나는 1박 2일이 중간에 떡하니', type: 'b' },
          { label: '요일마다 다른 사람과의 약속이 빼곡', type: 'd' },
          { label: '계획표가 없는 게 계획', type: 'a' },
          { label: '정주행 목록이 곧 계획표', type: 'c' },
        ],
      },
      {
        text: '방학 중간에 친구한테 "뭐 해?" 연락이 오면?',
        choices: [
          { label: '"아무것도 안 해. 그게 좋아"', type: 'a' },
          { label: '"나 지금 여행 중! 사진 봐봐"', type: 'b' },
          { label: '"오늘 볼래? 나 완전 한가해"', type: 'd' },
          { label: '"미안 지금 제일 중요한 장면이야"', type: 'c' },
        ],
      },
      {
        text: '방학 기념으로 하나 산다면?',
        choices: [
          { label: '같이 모여 놀 때 쓸 보드게임', type: 'd' },
          { label: '걷기 좋은 운동화', type: 'b' },
          { label: '제일 푹신한 이불', type: 'a' },
          { label: '밀린 책이나 시리즈 정주행 이용권', type: 'c' },
        ],
      },
      {
        text: '방학 마지막 날 밤, 제일 뿌듯할 장면은?',
        choices: [
          { label: '완주한 시리즈의 엔딩 크레딧', type: 'c' },
          { label: '일주일 내내 잘 쉰 말랑말랑한 내 상태', type: 'a' },
          { label: '사진첩에 쌓인 사람들과의 순간들', type: 'd' },
          { label: '어디 다녀온 티가 나는 까매진 얼굴', type: 'b' },
        ],
      },
    ],
    results: [
      {
        id: 'a',
        name: '방콕 방학',
        emoji: '🛏️',
        summary: '집에서 조용히 보내는 일주일이 제일 달콤한 방학',
        description:
          '너의 방학은 방콕 방학. 어디 안 가도, 뭘 안 해도 집에서 조용히 보내는 일주일이 제일 달콤하지. 이불 속에서 틀어둘 잔잔한 노래 한 곡 만들자.',
        music: { family: 'calm', style: 'curtains drawn all week, cozy do-nothing piano' },
      },
      {
        id: 'b',
        name: '훌쩍 떠나는 방학',
        emoji: '🚆',
        summary: '몸을 움직여 떠나야 쉬는 기분이 드는 방학',
        description:
          '너의 방학은 훌쩍 떠나는 방학. 쉬라고 줘도 가만히는 못 있고, 몸을 움직여야 쉬는 기분이 들지. 떠나는 길에 어울리는 노래 한 곡 챙겨 가자.',
        music: { family: 'stress', style: 'packed backpack, open road rhythm' },
      },
      {
        id: 'c',
        name: '정주행 방학',
        emoji: '📺',
        summary: '다른 세계에 일주일쯤 다녀오는 게 휴가인 정주행 방학',
        description:
          '너의 방학은 정주행 방학. 현실 말고 다른 세계에 일주일쯤 다녀오는 게 너의 휴가구나. 정주행 사이에 흐를 노래를 직접 만들어 보자.',
        music: { family: 'sad', style: 'all-night marathon, story-deep strings' },
      },
      {
        id: 'd',
        name: '약속 가득 방학',
        emoji: '🎉',
        summary: '쉬는 날일수록 보고 싶은 얼굴부터 떠오르는 방학',
        description:
          '너의 방학은 약속 가득 방학. 쉬는 날일수록 보고 싶은 얼굴부터 떠오르는 타입이지. 모임에서 같이 틀 노래 한 곡 만들어 보자.',
        music: { family: 'happy', style: 'calendar full of friends, cheerful horns' },
      },
    ],
  },
  {
    id: 'monday-survival',
    title: '나의 월요일 생존법',
    subtitle: '또 돌아온 월요일, 나는 이렇게 버틴다',
    emoji: '📅',
    minutes: 2,
    tag: '가벼운 테스트',
    category: 'light',
    thumb: '/village/screens/test-1.webp',
    questions: [
      {
        text: '일요일 밤, 내일이 월요일인 게 실감 나는 순간 나는?',
        choices: [
          { label: '월요일에 볼 사람 생각하며 그나마 위안', type: 'd' },
          { label: '내일 아침 들을 플레이리스트부터 정리', type: 'c' },
          { label: '일찍 자는 걸로 조용히 항복', type: 'a' },
          { label: '일단 씻고 몸부터 리셋', type: 'b' },
        ],
      },
      {
        text: '월요일 아침, 알람 끄고 제일 먼저 하는 건?',
        choices: [
          { label: '창문 열고 찬 공기 한 번 들이마시기', type: 'b' },
          { label: '5분이라도 조용히 눈 감고 누워 있기', type: 'a' },
          { label: '노래 틀면서 준비 시작', type: 'c' },
          { label: '단톡 확인. 밤새 뭔 일 없었나', type: 'd' },
        ],
      },
      {
        text: '월요일 등굣길 필수템 하나를 고른다면?',
        choices: [
          { label: '같이 가는 친구', type: 'd' },
          { label: '이어폰. 이거 없으면 못 나감', type: 'c' },
          { label: '아무도 없는 이른 시간의 한적함', type: 'a' },
          { label: '조금 돌아가더라도 걷는 길', type: 'b' },
        ],
      },
      {
        text: '월요일 오전을 버티게 해주는 생각은?',
        choices: [
          { label: "'점심에 걔 만나니까 그때까지만 버티자'", type: 'd' },
          { label: "'점심시간에 혼자 조용히 숨 돌릴 수 있어'", type: 'a' },
          { label: "'쉬는 시간에 잠깐 밖에 나갔다 오자'", type: 'b' },
          { label: "'끝나고 보려고 아껴둔 거 있다'", type: 'c' },
        ],
      },
      {
        text: '월요일 점심시간, 나는?',
        choices: [
          { label: '밥 빨리 먹고 바람 쐬러 나간다', type: 'b' },
          { label: '사람들이랑 떠드는 게 유일한 낙', type: 'd' },
          { label: '혼자 조용한 데서 재충전', type: 'a' },
          { label: '이어폰 끼고 혼밥, 나만의 휴식', type: 'c' },
        ],
      },
      {
        text: '월요일 저녁, 드디어 하루가 끝났다. 제일 하고 싶은 건?',
        choices: [
          { label: '보고 싶던 거 틀어놓고 완전 몰입', type: 'c' },
          { label: '"월요일 끝!" 하고 친구들이랑 한풀이', type: 'd' },
          { label: '동네 한 바퀴 걸으면서 머리 비우기', type: 'b' },
          { label: '집에서 아무 말도 안 하고 쉬기', type: 'a' },
        ],
      },
    ],
    results: [
      {
        id: 'a',
        name: '잠수 모드',
        emoji: '🤿',
        summary: '조용한 틈을 확보해 소리 없이 버티는 월요일',
        description:
          '너의 월요일 생존법은 잠수 모드. 조용한 틈을 확보해서 소리 없이 버티는 타입이구나. 잠수 중에 들을 고요한 노래 한 곡 만들어 두자.',
        music: { family: 'calm', style: 'do-not-disturb morning, steady quiet pulse' },
      },
      {
        id: 'b',
        name: '아침 공기 리셋',
        emoji: '🌬️',
        summary: '몸을 움직이고 바람을 쐬어야 굴러가는 월요일',
        description:
          '너의 월요일 생존법은 아침 공기 리셋. 몸을 움직이고 바람을 쐬어야 월요일이 굴러가지. 걷는 속도에 맞는 노래 한 곡이면 월요일도 좀 가벼워질 거야.',
        music: { family: 'stress', style: 'cold morning air, wake-up stride beat' },
      },
      {
        id: 'c',
        name: '이어폰 결계',
        emoji: '🎧',
        summary: '이어폰 결계 안에서 월요일을 한 겹 멀리 두는 타입',
        description:
          '너의 월요일 생존법은 이어폰 결계. 이어폰을 끼는 순간 월요일이 한 겹 멀어지지. 오늘은 그 결계 안에 틀 노래를 직접 만들어 보자.',
        music: { family: 'sad', style: 'earphone shield, enveloping warm synth' },
      },
      {
        id: 'd',
        name: '점심 약속 부스터',
        emoji: '🍱',
        summary: '점심 약속 하나로 오전을 통째로 버티는 타입',
        description:
          '너의 월요일 생존법은 점심 약속 부스터. 사람과의 약속 하나가 오전을 통째로 버티게 해주는구나. 그 사람이랑 같이 듣고 싶은 노래 한 곡 만들어 보자.',
        music: { family: 'happy', style: 'lunch date boost, bouncy chatter tune' },
      },
    ],
  },
];
