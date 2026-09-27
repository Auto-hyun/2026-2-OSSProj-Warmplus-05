# 온기레터 카드 그림 — 생성 가이드 (카테고리별 최신 5편, 50장)

카드 그림이 없는 레터는 앱에서 **기본 카드**(카테고리 색 + 제목 이모지)로 보여요.
아래 50장을 만들어 넣으면 자동으로 그림 카드로 바뀝니다.

## 넣는 방법
1. 이미지를 `public/letters/{id}.webp`로 저장 (권장 800×600, 4:3)
2. `src/data/letters.json`에서 같은 `id` 항목에 `"image": "/letters/{id}.webp"` 추가
3. `npm run sync:letters`를 다시 돌려도 `image`와 `category`는 유지돼요

## 공통 스타일 (모든 장면에 붙여 쓰기)
참고 이미지: `public/mascot/v2/stage-5.png` (캐릭터 일관성을 위해 함께 넣어 주세요)

```
A cute, round, fluffy white long-tailed tit chick (Shima-enaga) mascot with small black bead eyes and a tiny dark beak,
soft photoreal 3D render with detailed fur, {SCENE},
warm cream background (#FDFAF5), soft natural window light, gentle pastel accents, cozy and calm mood,
minimal props, centered composition with generous empty space, no text, no letters, no watermark, aspect ratio 4:3
```

## 장면 목록 (`{SCENE}`에 넣을 문장)

### 연애·사랑 (love)
| id | 레터 | SCENE |
|---|---|---|
| 3557158 | 사랑하는 사람의 힘든 시간, 어떻게 함께 하면 좋을까요? | two fluffy chicks leaning against each other, sharing one small knitted orange scarf, a yarn ball beside them |
| 3399664 | 운명처럼 다가온 사람 앞에서 자꾸 망설여져요 | the chick standing shyly on a moonlit windowsill holding a tiny envelope, a crescent moon outside |
| 3214056 | 너무 솔직한 연인이 가끔은 버거워요 | two chicks sitting a little apart on a wooden bench, a small vintage key resting between them |
| 3101108 | 결혼을 준비하며 서로 몰랐던 모습을 보게 돼요 | two chicks side by side looking into a small round mirror, a tiny ring box with a ribbon nearby |
| 2994650 | 표현이 적은 연인에게 서운할 때가 있어요 | one chick quietly slipping a heart-shaped bookmark into an open book for another chick |

### 가족 (family)
| id | 레터 | SCENE |
|---|---|---|
| 2780755 | 쉽게 시작하고, 금방 그만두는 아이가 걱정돼요 | a small chick playing with colorful toy blocks while a bigger bird watches warmly from behind |
| 2394015 | 부모님께 사랑하는 마음을 표현하고 싶어요 | the chick offering a handwritten letter and a small flower to two larger birds under a full moon |
| 2264350 | 아빠와의 어색한 관계를 진전시킬 수 있을까요? | the chick and a bigger bird sitting on the same bench with two warm mugs, a small house behind |
| 2159686 | 제가 사춘기가 돼면 언니한테 잘해줄 수 있을까요? | two chicks of different sizes, the smaller one handing the bigger one a spring flower bud |
| 2002414 | 결혼 2년 차, 아이를 갖는 것이 고민돼요 | two chicks in a cozy nest looking at a tiny folded baby blanket, soft hopeful light |

### 친구·관계 (relationship)
| id | 레터 | SCENE |
|---|---|---|
| 3032358 | 모두에게 좋은 사람이고 싶어요 | the chick gently conducting floating music notes, small birds listening around it |
| 2325047 | 사람에게 너무 쉽게 정을 주고 상처를 받아요 | the chick hugging a soft peach-colored cushion, a small bandage lying on a leaf beside it |
| 2212464 | 소중한 이들에게 더 많은 사랑을 주고 싶어요 | the chick carrying several small wrapped gifts with ribbons toward a group of friends |
| 2123683 | 주변 사람들과 깊은 관계를 맺기 어려워요 | the chick on stepping stones across a calm pond, other birds waiting on the far side |
| 2031975 | 어떻게 관계를 잘 끝맺음할 수 있을까요? | the chick tying a ribbon around a small letter box, a few autumn leaves falling |

### 진로·꿈 (career)
| id | 레터 | SCENE |
|---|---|---|
| 3522685 | 선택의 순간 무엇을 가장 중요하게 생각해야 할까요? | the chick holding a brass compass at a small signpost where two paths split |
| 3056252 | 제가 선택한 이 길이 맞는 걸까요? | the chick walking a small path with a glowing lantern under a crescent moon |
| 2923678 | 좋아하는 걸 지켜낼 수 있는 어른이 되고 싶어요 | the chick standing beside a small lighthouse with its light on, calm sea |
| 2854307 | 새로운 길을 찾아 출발점에 다시 선 직장인이에요 | the chick at a starting line holding a little red flag, a road winding into soft hills |
| 2586275 | 새로운 도전 앞에 망설이지 않을 용기가 필요해요 | the chick on a hilltop watching the sunrise, wings slightly spread |

### 직장·일 (work)
| id | 레터 | SCENE |
|---|---|---|
| 3450870 | 언제쯤 출근이 행복해질까요? | the chick at a morning bus stop holding a croissant and a tiny briefcase |
| 3189879 | 좋아하던 일이 현실이 되니, 마음이 예전 같지 않아요 | the chick resting on a snowy windowsill beside a paintbrush and a small canvas |
| 3124639 | 이직을 해야할지 말지 너무 고민돼요 | the chick holding a small briefcase, standing between two different doors |
| 3015140 | 직장생활 6년 차, 온전한 '나'로 살아가고 싶어요 | the chick sitting under a big leafy tree next to a closed laptop |
| 2737733 | 요즘 퇴사하고 싶다는 생각이 자주 들어요 | the chick looking out an office window, a small cloud-shaped thought bubble above |

### 나·자존감 (self)
| id | 레터 | SCENE |
|---|---|---|
| 3498564 | 누군가의 기대를 채우며 살아가고 있는 것 같아요 | the chick setting down a small red backpack full of little stars |
| 3421329 | 많은 경험에도, 늘 채워지지 않는 기분이에요 | the chick trying on a tiny knitted sweater in front of a mirror, a small clothes rack beside |
| 3374176 | 나이는 계속 들어가는데, 이뤄낸 게 많지 않은 것 같아요 | the chick paddling in a calm pond next to a graceful swan, soft ripples |
| 3356511 | 나를 자유롭게 놓아주고 싶어요 | the chick letting a green leaf float away on the breeze in an open field |
| 3148199 | 모두가 이런 후회 속에서 살아가고 있는 걸까요? | the chick sitting beside a lit candle, looking at a small old photograph |

### 불안·지침 (anxiety)
| id | 레터 | SCENE |
|---|---|---|
| 3545925 | 해야 할 일을 자꾸만 미루게 돼요 | the chick at a tiny desk with a notepad, a checklist with just the first item checked |
| 3078741 | 잘하고 싶은 마음과 게으름 사이에서 자주 흔들려요 | the chick resting on a wide stair landing under a leaf blanket |
| 2961631 | 너무 많은 부담을 안고 살아가는 것 같아요 | the chick carefully setting down a few soft clouds it was carrying on its head |
| 2946967 | 막연한 불안감에 새로운 시작을 망설이게 돼요 | the chick waiting at a tiny crosswalk as the traffic light turns green |
| 2829121 | 지쳐버린 몸과 마음, 다시 충전될 수 있을까요? | the chick napping under a cozy blanket next to a small charging lamp glowing softly |

### 외로움·그리움 (loneliness)
| id | 레터 | SCENE |
|---|---|---|
| 3475151 | 혼자가 아닌데도 자주 외로움을 느껴요 | the chick sitting at the edge of a group of birds, a small thought bubble above it |
| 3238922 | 제가 사랑하는 모든 것들이 변해버릴까 두려워요 | the chick holding an old pocket watch while flower petals drift down |
| 2861434 | '영원'한 것은 정말 없는 걸까요? | the chick sitting on a hill at dusk looking up at a sky full of sparkles |
| 2664512 | To. 그리운 당신에게, 잘 지내고 계시죠? | the chick writing a letter at a small desk by the window, a photo frame beside it |
| 2544626 | 친한 친구와 함께 있어도 외로움이 느껴져요 | two chicks on a snowy bench looking in different directions, gentle snowflakes |

### 일상·행복 (daily)
| id | 레터 | SCENE |
|---|---|---|
| 3332155 | 어떻게 하면 제 삶에도 열정이 생길까요? | the chick looking up at a softly glowing light bulb with tiny sparks |
| 3258744 | 온기님의 행복은 어디에서 시작되나요? | the chick finding a three-leaf clover in soft grass |
| 3167982 | 온기님의 모든 소원이 선명하게 닿길 바라요 | the chick making a wish with closed eyes as a shooting star passes |
| 2640651 | 매일이 주말인 것처럼 즐겁게 지내고 싶어요 | the chick having a small picnic on a blanket among ferns and green leaves |
| 2556762 | 하루에 5분, 나를 설레게 하는 작은 일을 선물해 보면 어떨까요? | the chick opening a small gift box with a ribbon, a little confetti |

### 온기 소식 (news)
| id | 레터 | SCENE |
|---|---|---|
| 2808514 | 세상을 빛내고 있는 다정한 온기님에게 | the chick surrounded by many small envelopes with heart seals, soft sparkles |
| 2581077 | 2024 온기레터 결산: 소복이 쌓인 온기 | the chick next to a small snowman and a stack of letters tied with a ribbon |
| 2569479 | 따뜻함을 전하려 노력하는 우리에게 | the chick wearing a knitted scarf, handing a warm letter to another bird |
| 2528121 | 온기를 담아 걸어온 11월의 손걸음 | the chick holding a fountain pen and writing on paper, autumn leaves around |
| 2492019 | (광고) 온기님 안의 보석은 늘 반짝반짝 빛나고 있을 거예요 | the chick holding a small gem that glows softly |
