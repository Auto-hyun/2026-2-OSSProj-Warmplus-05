// E그룹: 오목이 세계관 테스트 — 감정 4갈래 축(a 맑음/b 잔잔/c 비/d 바람) + 전부 mood 기록 연결
import type { PsychTest } from '../tests';

export const VILLAGE_TESTS: readonly PsychTest[] = [
  {
    id: 'fluffy-friend',
    title: '나의 털뭉치 친구 찾기',
    subtitle: '오목이 집에 놀러 간 날, 나랑 제일 닮은 친구는 누구일까?',
    emoji: '🐾',
    minutes: 2,
    tag: '가벼운 테스트',
    category: 'light',
    thumb: '/village/screens/test-1.webp',
    questions: [
      {
        text: '오목이 집에 처음 놀러 갔다. 문이 열리자마자 나는?',
        choices: [
          { label: '일단 제일 푹신해 보이는 방석에 자리 잡는다', type: 'b' },
          { label: '와 뭐야, 구경할 거 많다! 신나서 돌아다님', type: 'a' },
          { label: '들어가도 되나... 하고 문 앞에서 잠깐 머뭇', type: 'c' },
          { label: '어디 앉지, 뭐 하고 놀지 머릿속으로 동선부터 짠다', type: 'd' },
        ],
      },
      {
        text: '털뭉치 친구들이 우르르 몰려와서 인사한다. 나는?',
        choices: [
          { label: '한 마리씩 천천히 눈 맞추며 인사', type: 'b' },
          { label: '너무 많아서 누구부터 인사해야 할지 살짝 정신없음', type: 'd' },
          { label: '나도 신나서 같이 뒹군다', type: 'a' },
          { label: '제일 조용한 친구 옆에 슬쩍 앉는다', type: 'c' },
        ],
      },
      {
        text: '다 같이 놀 거리를 정하기로 했다. 내가 내는 의견은?',
        choices: [
          { label: '"숨바꼭질! 아니면 베개싸움!"', type: 'a' },
          { label: '"난 아무거나~ 다수결 따를게"', type: 'b' },
          { label: '"그냥 누워서 수다 떨면 안 돼?"', type: 'c' },
          { label: '"놀기 전에 할 거 먼저 끝내고 놀자"', type: 'd' },
        ],
      },
      {
        text: '놀다가 창밖에 비가 내리기 시작했다. 나는?',
        choices: [
          { label: '빗소리 들으니까 괜히 마음이 말랑해진다', type: 'c' },
          { label: '빗소리 좋다~ 하고 더 느긋해짐', type: 'b' },
          { label: '집에 어떻게 가지? 우산 챙겼었나?', type: 'd' },
          { label: '비 오면 오는 대로 재밌지! 창문에 붙어서 구경', type: 'a' },
        ],
      },
      {
        text: '한참 놀다가 갑자기 조용해진 순간, 나는?',
        choices: [
          { label: '이 틈에 미뤄둔 생각들을 우르르 꺼낸다', type: 'd' },
          { label: '"야 우리 이제 뭐 하고 놀지?" 하고 침묵을 깬다', type: 'a' },
          { label: '조용한 것도 좋네, 하고 가만히 있는다', type: 'b' },
          { label: '아까 했던 말이 괜히 마음에 남아서 곱씹는 중', type: 'c' },
        ],
      },
      {
        text: '헤어질 시간. 문 앞에서 내가 하는 인사는?',
        choices: [
          { label: '"다음엔 우리 집에서 봐! 날짜 잡자"', type: 'a' },
          { label: '"잘 있어. 나 가고 나서도 재밌게 놀아" 하며 아쉬운 뒷걸음', type: 'c' },
          { label: '"잘 놀았다~ 또 올게" 하고 느긋하게', type: 'b' },
          { label: '"가서 할 일 있어서 먼저 갈게! 미안!"', type: 'd' },
        ],
      },
    ],
    results: [
      {
        id: 'a',
        name: '햇살 노랑이',
        emoji: '🌞',
        summary: '같이 있으면 다들 괜히 웃게 되는 햇살 타입',
        description:
          '넌 방 안을 제일 환하게 만드는 햇살 노랑이랑 닮았어. 같이 있으면 다들 괜히 웃게 되는 타입. 노랑이랑 같이 통통 튀는 노래 하나 만들어 보자.',
        music: { family: 'happy', style: 'sunny fur bouncing, playful bells' },
        mood: 'joy',
      },
      {
        id: 'b',
        name: '뭉게 초록이',
        emoji: '☁️',
        summary: '조용히 있어도 곁이 편해지는 타입',
        description:
          '넌 구석 방석의 터줏대감 뭉게 초록이랑 닮았어. 조용히 있어도 곁이 편해지는 타입이야. 초록이처럼 몽글몽글한 노래 한 곡 어때.',
        music: { family: 'calm', style: 'fluffy cloud cushion, soft humming' },
        mood: 'calm',
      },
      {
        id: 'c',
        name: '빗방울 파랑이',
        emoji: '💧',
        summary: '마음이 깊고 여운이 긴 타입',
        description:
          '넌 창가에서 빗소리 듣는 걸 좋아하는 빗방울 파랑이랑 닮았어. 마음이 깊고 여운이 긴 타입. 파랑이랑 촉촉한 노래 한 곡 만들자.',
        music: { family: 'sad', style: 'small raindrop steps, tender piano' },
        mood: 'sad',
      },
      {
        id: 'd',
        name: '회오리 보라',
        emoji: '🌀',
        summary: '생각도 몸도 쉴 틈 없이 도는 중인 타입',
        description:
          '넌 집 안을 제일 부지런히 도는 회오리 보라랑 닮았어. 생각도 몸도 쉴 틈 없이 도는 중이지. 보라가 잠깐 멈춰 쉬는 것 같은 노래부터 한 곡.',
        music: { family: 'stress', style: 'tiny whirlwind settling down, steady heartbeat drums' },
        mood: 'anxious',
      },
    ],
  },
  {
    id: 'my-marble',
    title: '내가 유리병 구슬이라면',
    subtitle: '오늘의 나를 구슬로 만들면 어떤 모양일까?',
    emoji: '💠',
    minutes: 2,
    tag: '가벼운 테스트',
    category: 'light',
    thumb: '/village/screens/test-2.webp',
    questions: [
      {
        text: '오늘 하루에서 구슬로 만들고 싶은 순간을 하나 고른다면?',
        choices: [
          { label: '빵 터져서 웃었던 순간', type: 'a' },
          { label: '뭔가 서운하거나 뭉클했던 순간', type: 'c' },
          { label: '아무 일 없이 편안했던 순간', type: 'b' },
          { label: '솔직히 다 정신없어서 고를 틈이 없었다', type: 'd' },
        ],
      },
      {
        text: '구슬이 유리병에 또르르 들어간다. 그 순간 나는?',
        choices: [
          { label: '쌓인 거 보니까 할 일 하나 끝낸 기분', type: 'd' },
          { label: '괜히 뿌듯해서 병을 들고 흔들어 본다', type: 'a' },
          { label: '소리가 예뻐서 잠깐 귀 기울인다', type: 'b' },
          { label: '오늘 하루가 요만한 구슬이 됐구나, 싶어서 뭉클', type: 'c' },
        ],
      },
      {
        text: '병에 구슬이 거의 다 찼다. 드는 생각은?',
        choices: [
          { label: '벌써? 이 병이랑 헤어지기 아쉽다', type: 'c' },
          { label: '다 차면 뭐 나오지? 두근두근', type: 'a' },
          { label: '다음 병 준비해야 하나, 벌써 계획 중', type: 'd' },
          { label: '천천히 잘 채웠네, 하고 흐뭇하게 바라봄', type: 'b' },
        ],
      },
      {
        text: '내 구슬을 귀에 대고 흔들면 들릴 것 같은 소리는?',
        choices: [
          { label: '짤랑짤랑 경쾌한 방울 소리', type: 'a' },
          { label: '웅웅 쉴 새 없이 돌아가는 소리', type: 'd' },
          { label: '아무 소리 없는 고요함', type: 'b' },
          { label: '토독토독 작은 빗소리', type: 'c' },
        ],
      },
      {
        text: '구슬을 햇빛에 비춰 봤다. 안에 보이는 것은?',
        choices: [
          { label: '반짝이는 조각들이 춤추고 있다', type: 'a' },
          { label: '작은 물방울이 고여 있다', type: 'c' },
          { label: '뿌연 기류가 빙글빙글 돌고 있다', type: 'd' },
          { label: '맑고 투명하게 빛이 그대로 통과한다', type: 'b' },
        ],
      },
      {
        text: '누가 내 구슬을 집어 들고 "이건 무슨 구슬이야?" 하고 묻는다면?',
        choices: [
          { label: '"그날 좀 바빴던 날이야. 자세히 보면 아직 돌고 있어"', type: 'd' },
          { label: '"최고로 재밌던 날! 들어볼래?" 하고 신나서 설명', type: 'a' },
          { label: '"그냥... 조금 그리운 날이야" 하고 짧게', type: 'c' },
          { label: '"별일 없던 날인데, 그래서 좋았던 날"', type: 'b' },
        ],
      },
    ],
    results: [
      {
        id: 'a',
        name: '반짝이는 금빛 구슬',
        emoji: '✨',
        summary: '병 속에서도 제일 먼저 눈에 띄는 반짝임',
        description:
          '넌 햇빛만 닿으면 반짝이는 금빛 구슬이야. 병 속에서도 제일 먼저 눈에 띄지. 이 반짝임이 바래기 전에 밝은 노래에 담아두자.',
        music: { family: 'happy', style: 'sparkling glass marble, bright chimes' },
        mood: 'joy',
      },
      {
        id: 'b',
        name: '뽀얀 우윳빛 구슬',
        emoji: '🤍',
        summary: '보고 있으면 마음이 차분해지는 은은한 빛',
        description:
          '넌 은은하게 빛나는 우윳빛 구슬이야. 화려하진 않아도 보고 있으면 마음이 차분해져. 이 온도에 맞는 잔잔한 노래 한 곡 어때.',
        music: { family: 'calm', style: 'milky glass glow, round soft tones' },
        mood: 'calm',
      },
      {
        id: 'c',
        name: '물방울 맺힌 파란 구슬',
        emoji: '💧',
        summary: '아직 마르지 않은 마음이 고여 있는 구슬',
        description:
          '넌 물방울이 맺힌 파란 구슬이야. 안쪽에 아직 마르지 않은 마음이 고여 있네. 그 물기를 노래로 조금 덜어내 보자.',
        music: { family: 'sad', style: 'dew on blue glass, clear slow piano' },
        mood: 'sad',
      },
      {
        id: 'd',
        name: '소용돌이 무늬 구슬',
        emoji: '🌀',
        summary: '안에서 뭔가 계속 돌고 있는 구슬',
        description:
          '넌 소용돌이 무늬 구슬이야. 안에서 뭔가 계속 돌고 있지. 구슬도 병에 들어가면 가라앉듯이, 느린 노래 한 곡으로 소용돌이를 재워 보자.',
        music: { family: 'stress', style: 'swirling glass slowing to stillness, calm pulse' },
        mood: 'anxious',
      },
    ],
  },
  {
    id: 'village-home',
    title: '마음 마을 어디에 살까',
    subtitle: '마음 마을에 내 집이 생긴다면, 어디에 지어질까?',
    emoji: '🏡',
    minutes: 2,
    tag: '가벼운 테스트',
    category: 'light',
    thumb: '/village/screens/test-0.webp',
    questions: [
      {
        text: '마음 마을에 이사 왔다. 집 고를 때 제일 중요한 건?',
        choices: [
          { label: '볕 잘 들고 사람들이 자주 지나다니는 곳', type: 'a' },
          { label: '조용하고 풍경 좋은 곳', type: 'b' },
          { label: '어디든 좋으니까 일단 빨리 정해지는 곳', type: 'd' },
          { label: '아늑하고 아무나 못 찾아오는 곳', type: 'c' },
        ],
      },
      {
        text: '짐 정리 끝! 제일 먼저 가보고 싶은 곳은?',
        choices: [
          { label: '노래 공방. 조용히 구경만 해도 좋을 듯', type: 'b' },
          { label: '이야기 광장! 사람 구경이 제일 재밌지', type: 'a' },
          { label: '마음 테스트 숲. 혼자 걷기 좋아 보여', type: 'c' },
          { label: '일단 마을 전체를 한 바퀴 돌면서 지리부터 파악', type: 'd' },
        ],
      },
      {
        text: '광장에서 축제가 열린대. 나는?',
        choices: [
          { label: '당연히 간다. 맨 앞줄 사수', type: 'a' },
          { label: '갈까 말까 하다가 멀리서 불빛만 구경', type: 'c' },
          { label: '끝날 때쯤 슬쩍 가서 분위기만', type: 'b' },
          { label: '가고는 싶은데 밀린 일 생각에 발이 안 떨어짐', type: 'd' },
        ],
      },
      {
        text: '이웃이 문을 두드리며 떡을 들고 왔다. 나는?',
        choices: [
          { label: '고맙게 받고 차 한 잔 내온다', type: 'b' },
          { label: '"마침 잘 오셨어요!" 하고 수다 시작', type: 'a' },
          { label: '반가운데 뭐라 할지 몰라서 괜히 멋쩍음', type: 'c' },
          { label: '고마운데 지금 좀 바빠서... 다음에 꼭', type: 'd' },
        ],
      },
      {
        text: '비 오는 날, 마을의 내 집에서 나는?',
        choices: [
          { label: '지붕 두드리는 빗소리 들으면서 하루 종일 있을 수 있다', type: 'c' },
          { label: '창문 살짝 열고 비 냄새 맡으면서 느긋하게', type: 'b' },
          { label: '비 그치면 뭐 하고 놀지 계획 세움', type: 'a' },
          { label: '빨래 걷어야 하는데, 지붕 새는 데는 없나 점검', type: 'd' },
        ],
      },
      {
        text: '저녁에 집 창문에 불을 켜면서 드는 생각은?',
        choices: [
          { label: '오늘 마을에서 제일 시끌벅적했던 건 우리 집이었을 듯', type: 'a' },
          { label: '이 불빛 보고 누가 놀러 와 줬으면', type: 'c' },
          { label: '오늘도 할 일 다 못 했는데 벌써 밤이네', type: 'd' },
          { label: '딱 좋다, 이 고요함', type: 'b' },
        ],
      },
    ],
    results: [
      {
        id: 'a',
        name: '햇살 드는 언덕집',
        emoji: '🌅',
        summary: '마을에서 아침이 제일 먼저 오는 집',
        description:
          '네 집은 햇살 드는 언덕집이야. 마을에서 아침이 제일 먼저 오는 곳. 창문 활짝 열고 언덕 위에서 부를 노래 한 곡 만들자.',
        music: { family: 'happy', style: 'sunlit hilltop house, breezy ukulele' },
        mood: 'joy',
      },
      {
        id: 'b',
        name: '호숫가 오두막',
        emoji: '🏞️',
        summary: '물결도 마음도 잔잔한 집',
        description: '네 집은 호숫가 오두막이야. 물결도 마음도 잔잔한 곳. 호수에 띄워둘 것 같은 조용한 노래가 어울려.',
        music: { family: 'calm', style: 'still lake cabin, gentle water keys' },
        mood: 'calm',
      },
      {
        id: 'c',
        name: '가랑비 내리는 숲속 집',
        emoji: '🌧️',
        summary: '조금 젖어 있어도 포근한 집',
        description:
          '네 집은 가랑비 내리는 숲속 집이야. 조금 젖어 있어도 포근한 곳이지. 지붕 빗소리랑 어울리는 노래 한 곡 같이 만들자.',
        music: { family: 'sad', style: 'drizzle in the forest, mossy warm cello' },
        mood: 'sad',
      },
      {
        id: 'd',
        name: '바람 부는 전망대',
        emoji: '🌬️',
        summary: '제일 높아서 제일 많이 흔들리는 집',
        description:
          '네 집은 바람 부는 전망대야. 제일 높아서 제일 많이 흔들리는 곳. 바람 잦아드는 저녁 같은 노래로 하루를 내려놓자.',
        music: { family: 'stress', style: 'windy lookout calming down, grounded slow beat' },
        mood: 'anxious',
      },
    ],
  },
  {
    id: 'omok-diary',
    title: '오목이가 본 나',
    subtitle: '오목이가 몰래 쓰는 관찰일기에 나는 어떻게 적혀 있을까?',
    emoji: '📓',
    minutes: 2,
    tag: '나를 돌아보기',
    category: 'reflect',
    thumb: '/village/screens/test-1.webp',
    questions: [
      {
        text: '오목이가 하루 종일 날 졸졸 따라다녔다. 제일 많이 봤을 장면은?',
        choices: [
          { label: '뭐가 재밌는지 폰 보면서 실실 웃는 나', type: 'a' },
          { label: '이것저것 하느라 종종거리며 돌아다니는 나', type: 'd' },
          { label: '멍하니 창밖이나 허공을 보는 나', type: 'c' },
          { label: '내 자리에서 느긋하게 할 거 하는 나', type: 'b' },
        ],
      },
      {
        text: '집에 들어오자마자 오목이한테 하는 첫마디는?',
        choices: [
          { label: '"오목아 나 왔어~ 오늘 별일 없었지?"', type: 'b' },
          { label: '"오목아 들어봐, 오늘 진짜 웃긴 일 있었어"', type: 'a' },
          { label: '"하... 오목아, 나 오늘 좀 힘들었다"', type: 'c' },
          { label: '"어 왔어? 미안, 나 이것만 먼저 하고"', type: 'd' },
        ],
      },
      {
        text: '오목이가 "오늘 어땠어?" 하고 물으면 나는?',
        choices: [
          { label: '"뭐 했는지 기억도 안 나. 그냥 계속 뭘 하고 있었어"', type: 'd' },
          { label: '"그럭저럭? 나쁘지 않았어"', type: 'b' },
          { label: '"오늘? 완전 괜찮았지" 하고 썰 시작', type: 'a' },
          { label: '"음... 잘 모르겠어" 하고 말끝이 흐려짐', type: 'c' },
        ],
      },
      {
        text: '오목이가 옆에 와서 가만히 붙어 앉으면 나는?',
        choices: [
          { label: '털 만지작거리면서 같이 멍 때림', type: 'b' },
          { label: '갑자기 왜, 무슨 일 있어? 하고 살핌', type: 'd' },
          { label: '번쩍 안아 들고 부비부비 장난침', type: 'a' },
          { label: '아무 말 없이 꼭 끌어안는다', type: 'c' },
        ],
      },
      {
        text: '오목이가 듣기에 요즘 내가 제일 자주 하는 혼잣말은?',
        choices: [
          { label: '"아 맞다, 그것도 해야 되는데"', type: 'd' },
          { label: '"아 뭐야, 웃겨"', type: 'a' },
          { label: '"하아..." 한숨인지 혼잣말인지', type: 'c' },
          { label: '"음~ 좋네"', type: 'b' },
        ],
      },
      {
        text: '잠든 나를 보면서 오목이가 일기에 적을 마지막 문장은?',
        choices: [
          { label: '"오늘도 끝까지 웃다가 잠들었다"', type: 'a' },
          { label: '"오늘은 꿈에서라도 푹 쉬면 좋겠다"', type: 'd' },
          { label: '"잠든 얼굴이 낮보다 평온했다"', type: 'b' },
          { label: '"잠들기 전에 한참 뒤척였다. 무슨 생각을 했을까"', type: 'c' },
        ],
      },
    ],
    results: [
      {
        id: 'a',
        name: '자꾸 웃는 사람',
        emoji: '😄',
        summary: '옆에 있으면 오목이 털까지 간질간질해지는 웃음',
        description:
          "오목이의 관찰일기 — '오늘도 이 사람은 자주 웃었다. 옆에 있으면 나까지 털이 간질간질하다. 이 웃음, 노래로 만들어서 같이 듣자고 해야지.'",
        music: { family: 'happy', style: 'giggles scribbled in a diary, light pencil taps' },
        mood: 'joy',
      },
      {
        id: 'b',
        name: '천천히 걷는 사람',
        emoji: '🚶',
        summary: '같이 있으면 시간이 천천히 가는 사람',
        description:
          "오목이의 관찰일기 — '이 사람은 서두르는 법이 없다. 같이 있으면 시간이 천천히 가는 것 같다. 오늘의 느긋함은 잔잔한 노래로 담아두면 좋겠다.'",
        music: { family: 'calm', style: 'slow footsteps and page turns, warm hush' },
        mood: 'calm',
      },
      {
        id: 'c',
        name: '창밖을 보는 사람',
        emoji: '🪟',
        summary: '말 대신 창밖을 오래 보는 사람',
        description:
          "오목이의 관찰일기 — '오늘 이 사람은 창밖을 오래 봤다. 무슨 생각인지 묻는 대신 옆에 앉아 있었다. 말로 하기 어려우면 노래로 꺼내보자고 해야지.'",
        music: { family: 'sad', style: 'long gaze out the window, faraway piano' },
        mood: 'sad',
      },
      {
        id: 'd',
        name: '바쁘게 도는 사람',
        emoji: '🏃',
        summary: '하루 종일 돌아다녀서 오목이가 걱정하는 사람',
        description:
          "오목이의 관찰일기 — '오늘도 이 사람은 하루 종일 돌아다녔다. 앉은 건 밥 먹을 때뿐. 내일은 느린 노래 한 곡 틀어놓고 옆에 좀 앉혀놔야겠다.'",
        music: { family: 'stress', style: 'busy little footsteps finally resting, easing slowdown' },
        mood: 'anxious',
      },
    ],
  },
  {
    id: 'memory-shelf',
    title: '나의 기억 선반 테스트',
    subtitle: '다 찬 유리병이 선반에 올라간다면, 어떤 모습일까?',
    emoji: '🫙',
    minutes: 2,
    tag: '나를 돌아보기',
    category: 'reflect',
    thumb: '/village/screens/test-2.webp',
    questions: [
      {
        text: '기억 선반 앞에 섰다. 손이 제일 먼저 가는 병은?',
        choices: [
          { label: '제일 요란하게 반짝이는 병', type: 'a' },
          { label: '제일 최근 병. 아직 정리 안 된 기분이라', type: 'd' },
          { label: '색이 제일 깊고 차분한 병', type: 'b' },
          { label: '제일 오래된 병. 괜히 그립다', type: 'c' },
        ],
      },
      {
        text: '병을 열면 그날의 소리가 나온다면, 듣고 싶은 소리는?',
        choices: [
          { label: '친구들이랑 빵 터졌던 웃음소리', type: 'a' },
          { label: '보고 싶은 사람의 목소리', type: 'c' },
          { label: '아무 일 없던 오후의 조용한 공기', type: 'b' },
          { label: '뭔가 해냈던 날의 두근거림', type: 'd' },
        ],
      },
      {
        text: '요즘 채우는 중인 병을 들여다보면, 제일 많이 쌓인 구슬은?',
        choices: [
          { label: '이것저것 하느라 핑핑 돌았던 날의 구슬', type: 'd' },
          { label: '웃겨서 배 아팠던 날의 구슬', type: 'a' },
          { label: '무난하고 평화로웠던 날의 구슬', type: 'b' },
          { label: '마음이 가라앉았던 날의 구슬', type: 'c' },
        ],
      },
      {
        text: '예전 병을 꺼내 한참 들여다보다가 드는 생각은?',
        choices: [
          { label: '이때로 잠깐 돌아가 보고 싶다', type: 'c' },
          { label: '이런 날들이 쌓여서 지금의 나구나', type: 'b' },
          { label: '이땐 진짜 재밌었는데! 또 이런 날 만들어야지', type: 'a' },
          { label: '이때도 바빴네. 난 늘 뭔가 하고 있구나', type: 'd' },
        ],
      },
      {
        text: '새 병에 이름표를 붙인다면 쓰고 싶은 말은?',
        choices: [
          { label: '"숨 고르는 중"', type: 'd' },
          { label: '"요즘 최고로 좋았던 날들"', type: 'a' },
          { label: '"흐린 날도 내 날"', type: 'c' },
          { label: '"그냥, 괜찮았던 나날"', type: 'b' },
        ],
      },
      {
        text: '먼 훗날 이 선반을 다시 본다면, 바라는 풍경은?',
        choices: [
          { label: '색깔별로 골고루, 어떤 병도 버리지 않은 선반', type: 'b' },
          { label: '반짝이는 병이 줄줄이 늘어선 선반', type: 'a' },
          { label: '흔들리던 병들도 다 잔잔해져 있는 선반', type: 'd' },
          { label: '어떤 병을 열어도 이야기가 쏟아지는 선반', type: 'c' },
        ],
      },
    ],
    results: [
      {
        id: 'a',
        name: '반짝임이 가득한 병',
        emoji: '✨',
        summary: '좋은 날이 그만큼 쌓인 반짝이는 병',
        description:
          '네 병은 선반 위에서도 제일 반짝거려. 좋은 날이 그만큼 쌓였다는 뜻이야. 반짝임이 바래기 전에 노래 하나 더 얹어두자.',
        music: { family: 'happy', style: 'shelf of glittering jars, music box sparkle' },
        mood: 'joy',
      },
      {
        id: 'b',
        name: '고요히 가라앉은 병',
        emoji: '🫧',
        summary: '흔들림이 지나가고 남은 것들이 차곡차곡 쌓인 병',
        description:
          '네 병은 고요하게 가라앉은 병이야. 흔들림이 지나가고 남은 것들이 차곡차곡 쌓여 있어. 이 차분함에 어울리는 노래 한 곡 어때.',
        music: { family: 'calm', style: 'settled sea-glass jar, deep slow warmth' },
        mood: 'calm',
      },
      {
        id: 'c',
        name: '빗방울 자국이 남은 병',
        emoji: '🌧️',
        summary: '지나간 비가 남긴 무늬도 일부인 병',
        description:
          '네 병엔 빗방울 자국이 남아 있어. 지나간 비가 남긴 무늬도 병의 일부야. 그리운 날들을 노래로 한 곡 꺼내보자.',
        music: { family: 'sad', style: 'rain-streaked jar, longing strings' },
        mood: 'sad',
      },
      {
        id: 'd',
        name: '아직 찰랑이는 병',
        emoji: '🌀',
        summary: '가만히 두면 가라앉을, 아직 찰랑이는 병',
        description:
          '네 병은 아직 찰랑이고 있어. 가만히 두면 가라앉을 테니 조급해하지 않아도 돼. 병이 잔잔해지는 동안 들을 노래 한 곡 만들자.',
        music: { family: 'stress', style: 'jar still swaying then settling, steadying rhythm' },
        mood: 'anxious',
      },
    ],
  },
];
