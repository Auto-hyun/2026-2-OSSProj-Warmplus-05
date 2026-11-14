// D그룹 심리테스트: 음악 연결 — 결과가 음악 4갈래(happy/calm/sad/stress)에 직접 매핑된다
import type { PsychTest } from '../tests';

export const MUSIC_TESTS: readonly PsychTest[] = [
  {
    id: 'life-bgm',
    title: '내 인생 BGM 찾기',
    subtitle: '내 일상이 영화라면, 지금 깔릴 OST는?',
    emoji: '🎬',
    minutes: 2,
    tag: '가벼운 테스트',
    category: 'light',
    thumb: '/village/screens/test-2.webp',
    questions: [
      {
        text: '아침에 집을 나서는 순간, 영화가 시작된다면 첫 장면은?',
        choices: [
          { label: '경쾌한 음악에 발걸음 맞춰 걷는 나', type: 'a' },
          { label: '창밖 보며 이어폰 끼고 멍하니 있는 나', type: 'c' },
          { label: '시계 보고 전력 질주하는 나', type: 'd' },
          { label: '커피 들고 느긋하게 풍경 구경하는 나', type: 'b' },
        ],
      },
      {
        text: '요즘 내 일상에 제일 가까운 장르는?',
        choices: [
          { label: '별일 없이 흘러가는 잔잔한 일상물', type: 'b' },
          { label: '할 일에 쫓기는 긴박한 추격전', type: 'd' },
          { label: '웃을 일 많은 청춘 코미디', type: 'a' },
          { label: '혼자 생각이 많아지는 새벽 감성 멜로', type: 'c' },
        ],
      },
      {
        text: '카메라가 나를 클로즈업한다면, 어떤 순간일 것 같아?',
        choices: [
          { label: '친구들이랑 빵 터져서 웃는 순간', type: 'a' },
          { label: '밤에 혼자 창밖 보면서 생각에 잠긴 순간', type: 'c' },
          { label: '밀린 일을 드디어 다 끝낸 순간', type: 'd' },
          { label: '좋아하는 자리에서 조용히 쉬는 순간', type: 'b' },
        ],
      },
      {
        text: '내 영화에 꼭 들어갔으면 하는 장면은?',
        choices: [
          { label: '얽힌 문제가 한 방에 풀리는 장면', type: 'd' },
          { label: '노을 지는 길을 천천히 걷는 장면', type: 'b' },
          { label: '다 같이 모여서 신나게 노는 장면', type: 'a' },
          { label: '보고 싶은 사람을 오랜만에 만나는 장면', type: 'c' },
        ],
      },
      {
        text: '관객이 내 영화를 보고 나오면서 느꼈으면 하는 건?',
        choices: [
          { label: '"보는 내내 마음이 편안했다"', type: 'b' },
          { label: '"뭔가 뭉클하고 여운이 남는다"', type: 'c' },
          { label: '"속이 다 시원하다"', type: 'd' },
          { label: '"나도 저렇게 놀고 싶다"', type: 'a' },
        ],
      },
      {
        text: '엔딩 크레딧이 올라갈 때 깔리면 좋을 음악은?',
        choices: [
          { label: '다음 편이 기대되는 신나는 곡', type: 'a' },
          { label: '쌓인 게 싹 내려가는 시원한 곡', type: 'd' },
          { label: '조용히 하루를 닫아주는 곡', type: 'b' },
          { label: '자리에서 못 일어나게 하는 먹먹한 곡', type: 'c' },
        ],
      },
    ],
    results: [
      {
        id: 'a',
        name: '설레는 오프닝',
        emoji: '✨',
        summary: '뭐든 시작하기 좋은, 설렘 가득한 흐름',
        description:
          '네 인생 BGM은 설레는 오프닝이야. 뭐든 시작하기 좋은 흐름이네. 오늘 장면에 깔릴 밝은 곡, 직접 만들어서 틀어보자.',
        music: { family: 'happy', style: 'bright opening title, upbeat band' },
      },
      {
        id: 'b',
        name: '오후의 롱테이크',
        emoji: '🌤️',
        summary: '급할 것 없이 천천히 흘러가는 요즘',
        description:
          '네 인생 BGM은 오후의 롱테이크야. 급할 것 없이 흘러가는 요즘이구나. 이 장면엔 잔잔한 곡이 딱이야. 한 곡 깔아보자.',
        music: { family: 'calm', style: 'long sunny take, mellow acoustic' },
      },
      {
        id: 'c',
        name: '비 오는 회상 신',
        emoji: '🌧️',
        summary: '마음에 여운이 오래 남는 시기',
        description:
          '네 인생 BGM은 비 오는 회상 신이야. 마음에 여운이 오래 남는 시기네. 이 장면의 감정, 노래로 만들면 꽤 괜찮은 OST가 될 거야.',
        music: { family: 'sad', style: 'rainy flashback scene, tender strings' },
      },
      {
        id: 'd',
        name: '뻥 뚫리는 클라이맥스',
        emoji: '💥',
        summary: '꽉 막힌 장면 다음에 올 뚫리는 순간',
        description:
          '네 인생 BGM은 뻥 뚫리는 클라이맥스야. 꽉 막힌 장면 다음엔 뚫리는 장면이 오는 법. 그 순간을 앞당겨줄 시원한 곡을 만들어 보자.',
        music: { family: 'stress', style: 'tension breaking into open highway run' },
      },
    ],
  },
  {
    id: 'song-prescription',
    title: '지금 나에게 필요한 노래',
    subtitle: '내 마음이 쓰는 음악 처방전, 오늘은 어떤 노래가 나올까?',
    emoji: '💊',
    minutes: 2,
    tag: '나를 돌아보기',
    category: 'reflect',
    thumb: '/village/screens/test-0.webp',
    questions: [
      {
        text: '요즘 하루가 끝나면 어떤 기운이 남아?',
        choices: [
          { label: '아직 놀 힘 남아 있는데? 싶은 기운', type: 'a' },
          { label: '몸보다 머리가 더 피곤한 느낌', type: 'd' },
          { label: '딱히 힘든 건 아닌데 어딘가 허한 느낌', type: 'c' },
          { label: '적당히 쓰고 적당히 남은 느낌', type: 'b' },
        ],
      },
      {
        text: '노래 듣다가 나도 모르게 멈칫하는 순간은?',
        choices: [
          { label: '내 얘기 같은 가사가 나올 때', type: 'c' },
          { label: '드럼이 시원하게 터지는 구간', type: 'd' },
          { label: '아무 생각 없이 듣기 좋은 멜로디가 흐를 때', type: 'b' },
          { label: '어깨가 자동으로 들썩여질 때', type: 'a' },
        ],
      },
      {
        text: '요즘 몸이 먼저 보내는 신호가 있다면?',
        choices: [
          { label: '한숨이 늘었다. 어깨도 좀 뭉친 듯', type: 'd' },
          { label: '괜히 멍해지는 시간이 길어졌다', type: 'c' },
          { label: '특별한 신호 없음. 컨디션 무난', type: 'b' },
          { label: '가만히 못 있겠다. 어디든 나가고 싶다', type: 'a' },
        ],
      },
      {
        text: '요즘 제일 자주 하는 혼잣말에 가까운 건?',
        choices: [
          { label: '"아 재밌겠다, 이것도 해볼까?"', type: 'a' },
          { label: '"음... 뭐랄까, 설명하기 어렵네"', type: 'c' },
          { label: '"뭐 어떻게든 되겠지~"', type: 'b' },
          { label: '"하... 일단 이것부터 끝내자"', type: 'd' },
        ],
      },
      {
        text: '지금 노래 한 곡을 처방받는다면, 어디서 듣고 싶어?',
        choices: [
          { label: '불 꺼진 방 침대 위에서', type: 'c' },
          { label: '창문 열고 바람 맞으면서', type: 'd' },
          { label: '친구랑 같이 걷는 길에서', type: 'a' },
          { label: '좋아하는 의자에 파묻혀서', type: 'b' },
        ],
      },
      {
        text: '노래가 끝났을 때, 바라는 내 상태는?',
        choices: [
          { label: '어깨가 가볍고 머리가 맑아진 상태', type: 'd' },
          { label: '스르르 잠들 수 있을 만큼 느슨해진 상태', type: 'b' },
          { label: '기분이 올라가서 뭐든 하고 싶은 상태', type: 'a' },
          { label: '울적한 마음을 누가 알아준 것 같은 상태', type: 'c' },
        ],
      },
    ],
    results: [
      {
        id: 'a',
        name: '아침 비타민 한 알',
        emoji: '🍊',
        summary: '좋은 기운을 더 올려주는 밝은 곡 한 알',
        description:
          '처방전 나왔어. 오늘의 처방은 아침 비타민 한 알 같은 노래. 지금 기운이 꽤 좋으니까, 더 올려주는 밝은 곡 한 알이면 충분해. 바로 만들어 보자.',
        music: { family: 'happy', style: 'vitamin sunshine, bouncy clap-along' },
      },
      {
        id: 'b',
        name: '따뜻한 차 한 잔',
        emoji: '🍵',
        summary: '지금 이 온도를 지켜주는 잔잔한 곡',
        description:
          '오늘의 처방은 따뜻한 차 한 잔 같은 노래야. 지금 상태 나쁘지 않으니까, 이 온도를 지켜주는 잔잔한 곡이면 돼. 천천히 우려보자.',
        music: { family: 'calm', style: 'warm tea steam, slow soft piano' },
      },
      {
        id: 'c',
        name: '마음에 붙이는 반창고',
        emoji: '🩹',
        summary: '시큰한 마음을 알아주는 노래 한 곡',
        description:
          '네 처방전엔 이렇게 적혀 있어. 마음에 붙이는 반창고 같은 노래 한 곡. 어딘가 시큰한 마음엔 알아주는 노래가 약이야. 지금 기분 그대로 만들어 붙이자.',
        music: { family: 'sad', style: 'gentle healing, warm comforting strings' },
      },
      {
        id: 'd',
        name: '탄산 가득 사이다',
        emoji: '🥤',
        summary: '쌓인 걸 터뜨리는 뚜껑 따는 기분의 곡',
        description:
          '처방 결과가 나왔어. 탄산 가득 사이다 같은 노래가 필요해. 쌓인 건 흔들어서 터뜨리는 게 답이지. 뚜껑 따는 기분의 시원한 곡, 같이 만들자.',
        music: { family: 'stress', style: 'fizzy burst, knots loosening beat' },
      },
    ],
  },
  {
    id: 'playlist-personality',
    title: '나의 플레이리스트 성격',
    subtitle: '플리 관리하는 습관에 내 성격 다 들어 있다?',
    emoji: '🎧',
    minutes: 2,
    tag: '가벼운 테스트',
    category: 'light',
    thumb: '/village/screens/test-1.webp',
    questions: [
      {
        text: '내 플레이리스트 목록을 열어보면?',
        choices: [
          { label: '분위기별로 나름 정리돼 있다', type: 'b' },
          { label: '"진짜 신남", "텐션업" 같은 놀기용 플리가 제일 위', type: 'a' },
          { label: '아무한테도 공유 안 하는 플리가 하나 있다', type: 'c' },
          { label: '정리는 무슨, 좋아요 누른 곡 전체재생', type: 'd' },
        ],
      },
      {
        text: '노래 듣다가 완전 취향인 곡을 발견하면?',
        choices: [
          { label: '바로 친구한테 보낸다. 이거 들어봐', type: 'a' },
          { label: '혼자만 알고 싶어서 조용히 저장', type: 'c' },
          { label: '단골 플리에 슬쩍 추가', type: 'b' },
          { label: '그 곡만 한동안 무한반복', type: 'd' },
        ],
      },
      {
        text: '셔플 돌리다가 분위기 안 맞는 곡이 나오면?',
        choices: [
          { label: '어? 이것도 좋네 하고 그냥 듣는다', type: 'b' },
          { label: '바로 스킵. 지금은 이 텐션 아니야', type: 'a' },
          { label: '스킵하다가 결국 늘 듣던 그 곡으로 간다', type: 'c' },
          { label: '몇 번 스킵하다 성질나서 플리 갈아엎는다', type: 'd' },
        ],
      },
      {
        text: '친구가 "노래 추천 좀" 하면 나는?',
        choices: [
          { label: '요즘 꽂힌 신나는 곡부터 쏜다', type: 'a' },
          { label: '걔 분위기에 맞을 것 같은 곡을 고민해서 고른다', type: 'c' },
          { label: '내 단골 플리 링크를 통째로 준다', type: 'b' },
          { label: '"그냥 인기차트 틀어" 고르는 게 더 일임', type: 'd' },
        ],
      },
      {
        text: '몇 년 전에 만든 플리를 다시 열어보면 드는 기분은?',
        choices: [
          { label: '와 추억... 그때 생각나서 한참 듣는다', type: 'c' },
          { label: '지금 들어도 좋네. 역시 내 취향은 한결같다', type: 'b' },
          { label: '이거 틀고 놀던 때 재밌었는데, 또 놀고 싶다', type: 'a' },
          { label: '옛날 거 볼 새 없음. 지금 들을 곡도 밀려 있음', type: 'd' },
        ],
      },
      {
        text: '나에게 플레이리스트란?',
        choices: [
          { label: '버튼 하나로 올라가는 기분 스위치', type: 'a' },
          { label: '하루의 배경이 되어주는 공기 같은 것', type: 'b' },
          { label: '말로 못 하는 마음을 대신 담아두는 서랍', type: 'c' },
          { label: '세상 소음을 차단해주는 내 피난처', type: 'd' },
        ],
      },
    ],
    results: [
      {
        id: 'a',
        name: '떼창 유발 믹스',
        emoji: '🎤',
        summary: '좋은 건 같이 들어야 제맛인 타입',
        description:
          '네 플리는 떼창 유발 믹스야. 좋은 건 같이 들어야 제맛인 타입. 오늘은 네가 만든 곡으로 떼창 1열을 채워보자.',
        music: { family: 'happy', style: 'sing-along chorus, bright catchy hooks' },
      },
      {
        id: 'b',
        name: '매일 트는 단골 플리',
        emoji: '☕',
        summary: '질리지 않는 편안함이 취향의 중심',
        description:
          '네 플리는 매일 트는 단골 플리야. 질리지 않는 편안함이 네 취향의 중심이네. 단골 리스트에 들어갈 잔잔한 한 곡, 직접 만들어 보자.',
        music: { family: 'calm', style: 'everyday comfort loop, soft steady keys' },
      },
      {
        id: 'c',
        name: '새벽의 비밀 플리',
        emoji: '🌙',
        summary: '말 안 한 마음이 곡 사이사이에 담긴 플리',
        description:
          '네 플리는 새벽의 비밀 플리야. 아무한테도 말 안 한 마음이 곡 사이사이에 들어 있지. 오늘은 그 플리에 들어갈 노래를 하나 지어보자.',
        music: { family: 'sad', style: '3am secret playlist, mellow guitar' },
      },
      {
        id: 'd',
        name: '볼륨 최대 해방 플리',
        emoji: '🔊',
        summary: '쌓인 걸 날려버리는 버튼 같은 음악',
        description:
          '네 플리는 볼륨 최대 해방 플리야. 너한테 음악은 쌓인 걸 날려버리는 버튼이구나. 최대 볼륨으로 틀 시원한 곡, 지금 만들자.',
        music: { family: 'stress', style: 'max volume release, driving drums to calm outro' },
      },
    ],
  },
  {
    id: 'daily-soundtrack',
    title: '내 하루의 사운드트랙',
    subtitle: '아침부터 밤까지, 내 하루에 트랙을 깔아보자',
    emoji: '🎶',
    minutes: 2,
    tag: '가벼운 테스트',
    category: 'light',
    thumb: '/village/screens/test-2.webp',
    questions: [
      {
        text: '아침 알람을 끄고 첫 트랙을 깐다면?',
        choices: [
          { label: '눈 떠지는 경쾌한 곡', type: 'a' },
          { label: '아직 꿈결 같은 몽글한 곡', type: 'c' },
          { label: '하루 예열용 부드러운 곡', type: 'b' },
          { label: '곡 고를 시간 없음. 어제 듣던 거 이어재생', type: 'd' },
        ],
      },
      {
        text: '이동하는 길, 이어폰 속 분위기는?',
        choices: [
          { label: '걸음이 빨라지는 비트', type: 'a' },
          { label: '창밖 풍경이랑 잘 어울리는 곡', type: 'b' },
          { label: '사람 많은 지하철을 잊게 해주는 큰 볼륨', type: 'd' },
          { label: '괜히 센치해지는 곡. 출근길부터 영화 주인공', type: 'c' },
        ],
      },
      {
        text: '점심 먹고 돌아오는 길에 어울리는 트랙은?',
        choices: [
          { label: '소화도 시킬 겸 신나는 곡', type: 'a' },
          { label: '배부르고 평화로운 나른한 곡', type: 'b' },
          { label: '오후를 버티게 해줄 시원한 곡', type: 'd' },
          { label: '커피 들고 듣는 조금 쓸쓸한 곡', type: 'c' },
        ],
      },
      {
        text: '오후 3~4시, 제일 늘어지는 시간의 나는?',
        choices: [
          { label: '노래 바꿔 틀면서 텐션 끌어올린다', type: 'a' },
          { label: '할 일 산더미라 음악 들을 정신도 없다', type: 'd' },
          { label: '잔잔한 곡 틀어두고 내 페이스 유지', type: 'b' },
          { label: '창밖 보면서 딴생각. 노래는 거의 배경', type: 'c' },
        ],
      },
      {
        text: '하루 일정이 끝나고 돌아가는 길의 트랙은?',
        choices: [
          { label: '오늘 하루를 날려버리는 시원한 곡', type: 'd' },
          { label: '여운 있는 곡 들으면서 일부러 돌아가는 길', type: 'c' },
          { label: '아직 안 끝났지! 약속 가는 길의 신나는 곡', type: 'a' },
          { label: '하루를 정리해주는 차분한 곡', type: 'b' },
        ],
      },
      {
        text: '자기 전 마지막 트랙으로 고른다면?',
        choices: [
          { label: '내일이 기대되게 하는 기분 좋은 곡', type: 'a' },
          { label: '생각이 많아지는 밤에 어울리는 곡', type: 'c' },
          { label: '머릿속 소음을 꺼주는 조용한 곡', type: 'd' },
          { label: '스르르 잠들게 해주는 포근한 곡', type: 'b' },
        ],
      },
    ],
    results: [
      {
        id: 'a',
        name: '리듬 타는 모닝 트랙',
        emoji: '🌅',
        summary: '하루 종일 비트가 끊기지 않는 타입',
        description:
          '네 하루의 사운드트랙은 리듬 타는 모닝 트랙이야. 하루 종일 비트가 끊기지 않는 타입. 오늘의 하이라이트 트랙, 직접 만들어서 추가해 보자.',
        music: { family: 'happy', style: 'morning rhythm, light bouncing steps' },
      },
      {
        id: 'b',
        name: '해 질 녘 산책 트랙',
        emoji: '🌇',
        summary: '하루를 서두르지 않고 걷는 사람',
        description:
          '네 하루의 사운드트랙은 해 질 녘 산책 트랙이야. 하루를 서두르지 않고 걷는 사람이네. 이 속도에 맞는 잔잔한 트랙을 하나 깔아보자.',
        music: { family: 'calm', style: 'sunset stroll, warm slow guitar' },
      },
      {
        id: 'c',
        name: '깊어지는 밤 트랙',
        emoji: '🌃',
        summary: '하루의 진짜 주인공은 밤의 나',
        description:
          '네 하루의 사운드트랙은 깊어지는 밤 트랙이야. 하루의 진짜 주인공은 밤의 너구나. 그 시간의 공기를 담은 곡, 같이 만들어 보자.',
        music: { family: 'sad', style: 'deep night window, soft ambient piano' },
      },
      {
        id: 'd',
        name: '숨통 트이는 퇴근길 트랙',
        emoji: '🚃',
        summary: '하루치 소음 뒤에 오는 해방감',
        description:
          '네 하루의 사운드트랙은 숨통 트이는 퇴근길 트랙이야. 하루치 소음 뒤에 오는 그 해방감, 노래로 만들면 매일 퇴근길이 기다려질걸.',
        music: { family: 'stress', style: 'rush hour melting into breezy ride' },
      },
    ],
  },
  {
    id: 'karaoke-type',
    title: '노래방에서 나는?',
    subtitle: '마이크 잡은 모습에 지금 내 기분이 보인다',
    emoji: '🎤',
    minutes: 2,
    tag: '가벼운 테스트',
    category: 'light',
    thumb: '/village/screens/test-0.webp',
    questions: [
      {
        text: '"노래방 갈래?" 소리가 나왔다. 나는?',
        choices: [
          { label: '콜. 근데 조용한 코인 노래방은 어때?', type: 'b' },
          { label: '이미 일어남. 내가 제일 신남', type: 'a' },
          { label: '좋아. 요즘 지를 노래가 필요했어', type: 'd' },
          { label: '갈까 말까 하다가 따라간다. 가면 또 잘 부름', type: 'c' },
        ],
      },
      {
        text: '내 첫 곡 선곡 스타일은?',
        choices: [
          { label: '일단 분위기 올리는 모두가 아는 그 곡', type: 'a' },
          { label: '미리 생각해 둔 인생곡. 첫 곡부터 진심', type: 'c' },
          { label: '고음 터지는 곡으로 바로 시동', type: 'd' },
          { label: '부담 없는 곡으로 가볍게 몸풀기', type: 'b' },
        ],
      },
      {
        text: '친구가 노래 부르는 동안 나는?',
        choices: [
          { label: '옆에서 탬버린 치고 코러스 넣는 중', type: 'a' },
          { label: '다음 곡 고르면서 흥얼흥얼 따라 부른다', type: 'b' },
          { label: '가사 보면서 아 이 노래 좋지... 하고 있다', type: 'c' },
          { label: '간주 점프 버튼 누를 타이밍 재는 중', type: 'd' },
        ],
      },
      {
        text: '마이크가 나한테 넘어왔다. 하필 모르는 노래다. 나는?',
        choices: [
          { label: '모르는데 아는 척 리듬으로 때운다. 의외로 먹힘', type: 'a' },
          { label: '웃으면서 아는 사람한테 패스', type: 'b' },
          { label: '그 곡 끄고 내가 부르고 싶던 곡 바로 예약', type: 'd' },
          { label: '후렴은 어떻게든 따라 부른다. 감으로', type: 'c' },
        ],
      },
      {
        text: '분위기가 가라앉은 타이밍, 나는?',
        choices: [
          { label: '추억의 명곡 넣고 다 같이 부르게 만든다', type: 'a' },
          { label: '오히려 좋아. 이때가 발라드 타이밍이지', type: 'c' },
          { label: '물 마시면서 쉬어가는 타임도 필요하지', type: 'b' },
          { label: '빠른 곡 연속 예약으로 다시 끌어올린다', type: 'd' },
        ],
      },
      {
        text: '노래방에서 나왔을 때 제일 좋은 기분은?',
        choices: [
          { label: '아 실컷 놀았다, 재밌었다', type: 'a' },
          { label: '적당히 즐겁고 편안했던 기분', type: 'b' },
          { label: '목은 아픈데 속이 뻥 뚫린 기분', type: 'd' },
          { label: '그 노래 부를 때 살짝 울컥했던 여운', type: 'c' },
        ],
      },
    ],
    results: [
      {
        id: 'a',
        name: '탬버린 들고 무대 장악',
        emoji: '🎉',
        summary: '노래방을 콘서트장으로 만드는 텐션',
        description:
          '너는 탬버린 들고 무대 장악하는 타입이야. 네가 있으면 노래방이 콘서트장 되지. 그 텐션 그대로, 떼창하기 좋은 신나는 곡 하나 만들어 보자.',
        music: { family: 'happy', style: 'tambourine party, everyone singing along' },
      },
      {
        id: 'b',
        name: '소파 지박령 감상단',
        emoji: '🛋️',
        summary: '안 나서도 충분히 즐기고 있는 사람',
        description:
          '너는 소파에서 즐기는 감상단이야. 안 나서도 충분히 즐기고 있는 사람. 소파에서 흥얼거리기 좋은 편안한 곡, 네 걸로 하나 만들자.',
        music: { family: 'calm', style: 'cozy corner seat, easy swaying melody' },
      },
      {
        id: 'c',
        name: '2절부터 눈 감는 발라드',
        emoji: '🎙️',
        summary: '노래에 마음을 실을 줄 아는 사람',
        description:
          '너는 2절부터 눈 감는 발라드 타입이야. 노래에 마음을 실을 줄 아는 사람이네. 지금 그 마음, 네 가사로 담으면 네 인생곡이 될지도.',
        music: { family: 'sad', style: 'eyes closed ballad, swelling emotional chorus' },
      },
      {
        id: 'd',
        name: '지르고 나면 개운한 샤우팅',
        emoji: '🔥',
        summary: '노래방은 나의 합법적 해소 창구',
        description:
          '너는 지르고 나면 개운한 샤우팅 타입이야. 노래방은 너의 합법적 해소 창구구나. 목 안 아프게 지르는 법이 있어. 시원하게 터지는 곡을 직접 만들면 돼.',
        music: { family: 'stress', style: 'full shout chorus, everything released after' },
      },
    ],
  },
];
