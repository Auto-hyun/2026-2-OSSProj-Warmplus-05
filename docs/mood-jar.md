# 감정 유리병 (기능 뼈대, UI는 수아 담당)

하루에 하나씩 그날의 마음 날씨를 기록하면 유리병에 구슬이 쌓인다. 21개(3주)가 차면 마이페이지 "나의 유리병"으로 옮겨지고 요약을 보여준다.

## 데이터 (이미 동작함)
| 무엇 | 어디 | 설명 |
| --- | --- | --- |
| 감정 7종 | `src/data/moods.ts` | id, 이름, 날씨, 이모지, 구슬 색. 그림으로 바꿔도 id는 유지 |
| 하루 기록 | `AppState.moods` (`src/lib/storage/types.ts`) | `{ day, mood, source: 'checkin' \| 'test', testId?, note?, at }`, 하루 하나, 기기에 저장 |
| 기록하기 | `store.recordMood(mood, { note? })` | 같은 날 다시 하면 덮어쓴다 |
| 테스트 결과 → 기록 | `TestResult.mood` (`src/data/tests.ts`) | 결과에 mood를 넣으면 테스트 끝날 때 자동 기록 |
| 병 계산 | `src/lib/jar.ts` | `currentJar`(홈 병), `fullJars`(선반), `summarize`(감정별 개수·가장 많은 감정·기간), `JAR_SIZE = 21` |

## 뼈대 화면 (디자인 교체 대상)
| 컴포넌트 | 위치 | 지금 모습 |
| --- | --- | --- |
| `components/jar/MoodCheckIn.tsx` | 홈 위 | 감정 7개 버튼 |
| `components/jar/MoodJar.tsx` | 홈 | 21칸 동그라미에 구슬 색 |
| `components/jar/JarShelf.tsx` | 마이페이지 | 다 찬 병마다 기간·가장 많은 날씨·감정별 개수 |

UI 바꿀 때: 위 3개 파일의 화면만 바꾸고, 데이터는 `useApp((s) => currentJar(s.moods))`처럼 그대로 가져다 쓰면 된다.
(홈 배경 병 그림, 구슬이 떨어지는 연출, 감정 캐릭터 구슬 등)

## 아직 안 정한 것
- 병 크기 21칸(3주) 유지 여부
- 한 줄 메모 입력 칸을 보여줄지 (데이터는 `note`로 이미 받을 수 있음)
