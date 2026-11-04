# 오목이 대화 (기능 뼈대)

홈에서 오목이 그림을 누르면 `/chat`으로 가서 오목이와 대화한다. 대화는 이 기기에만 저장된다.
`src/.env.local`에 `ANTHROPIC_API_KEY`가 있으면 Claude로 답하고(모델 기본 claude-opus-5, `OMOK_MODEL`로 변경), 없으면 정해진 말로 답한다(offline).

## 구조
| 무엇 | 어디 | 설명 |
| --- | --- | --- |
| 대화 기록 | `AppState.chat.messages` | `{ id, role: 'user' \| 'omok', text, at, crisis? }`, 전부 저장 |
| 오목이 노트 | `AppState.chat.note` | 대화 20줄마다 `/api/chat/note`가 요약을 새로 써서 저장 |
| 대화 맥락 | `src/lib/omok/context.ts` | 노트 + 최근 14일 기분 + 최근 테스트 5개 + 최근 대화 20줄 → 대답할 때 이것만 서버로 보냄 |
| 대답 서버 | `src/app/api/chat/route.ts` · `src/lib/omok/claude.ts` | 위기 감지 → 키 없으면 정해진 말 → Claude 호출 (오목이 성격 지침 + 기억). IP당 10분 30회 |
| 위기 감지 | `src/lib/omok/safety.ts` | 위기 표현이면 109·112·119 안내를 먼저 답함 |
| 화면 | `src/components/chat/ChatScreen.tsx` | 뼈대 UI (말풍선, 입력창, 대화 지우기) |

## 남은 일
- 처음 대화할 때 "답변을 만들기 위해 대화 내용이 Claude로 전송된다"는 안내·동의 추가
- 배포할 때 팀 API 키로 교체 (Vercel 환경변수)
