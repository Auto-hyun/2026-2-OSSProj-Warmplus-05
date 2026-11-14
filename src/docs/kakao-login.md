# 카카오 로그인

마이페이지(`/me`) 계정 카드에서 카카오로 로그인한다. 로그인하면 다른 기기에서도 내가 쓴 커뮤니티 글을 보고 지울 수 있다.
노래·테스트·기분 기록·오목이 대화는 지금처럼 이 기기에만 저장된다 (계정에 올리지 않음).

## 구조
| 무엇 | 어디 | 설명 |
| --- | --- | --- |
| 로그인 로직 | `lib/supabase/kakao.ts` | 시작, 카카오에서 돌아온 결과 알림, 로그아웃, 계정 표시 |
| 계정 카드 | `components/me/AccountCard.tsx` | 마이페이지 프로필 아래. 손님이면 카카오 로그인 버튼, 로그인했으면 닉네임과 로그아웃 |

- Supabase Auth의 kakao 제공자를 쓴다. 카카오 키는 Supabase 대시보드에만 넣고, Vercel 환경 변수는 추가하지 않는다
- 글쓰기용 익명 계정과는 따로인 카카오 계정으로 로그인한다. 이메일을 주지 않아도 로그인된다
- 그래서 로그인 전에 이 기기에서 익명으로 쓴 글은 카카오 계정으로 옮겨지지 않는다 (카드에서 미리 알린다).
  익명 계정에 카카오를 이어 붙이는 방식(`linkIdentity`)은 Supabase가 카카오의 인증된 이메일을 요구해서, 이메일을 주지 않은 사람이 로그인에 실패해 쓰지 않는다 (2026-11-13 확인, Supabase Auth v2.197.0)
- 로그아웃은 이 기기에서만 한다. 그 뒤 글을 쓰면 새 익명 계정이 생긴다
- 권한은 그대로 Supabase RLS(`auth.uid() = user_id`)가 지킨다. DB 변경 없음

## 직접 해야 할 설정 (한 번)
카카오 콘솔 메뉴는 2025-12-03 개편 기준이다.

**카카오 디벨로퍼스 (developers.kakao.com)**
1. 앱 만들기: 앱 아이콘(250KB 이하, 128×128 권장), 앱 이름 "온사이드 아웃", 회사명(팀명), 카테고리
2. 앱 > 일반 > 비즈니스 정보 > **개인 개발자 비즈 앱** 전환 (먼저 우측 상단 계정 설정 > 본인인증, 사업자등록은 필요 없음)
   - 이유: Supabase는 카카오에 이메일 권한(`account_email`)을 항상 함께 요청하는데, 이메일 동의항목은 비즈 앱만 켤 수 있다. 안 켜면 카카오 화면에서 KOE205 오류
3. 카카오 로그인 > 사용 설정 > 상태 **ON**
4. 카카오 로그인 > 동의항목: 닉네임(필수), 프로필 사진(선택), 카카오계정(이메일)(선택). 세 개 모두 설정해야 한다
5. 앱 > 플랫폼 키 > REST API 키
   - 리다이렉트 URI: Supabase 콜백 주소 `https://<프로젝트>.supabase.co/auth/v1/callback` (Supabase 카카오 설정 화면의 Callback URL을 복사). Vercel 주소가 아니다
   - 클라이언트 시크릿: 코드 복사, 활성화 ON
   - REST API 키 복사

**Supabase 대시보드**
1. Authentication > Sign In / Providers > **Kakao**: 켜기, Client ID = REST API 키, Client Secret = 클라이언트 시크릿 코드, **Allow users without an email** 켜기 (이메일을 선택 동의로 둬서)
2. Authentication > URL Configuration
   - Site URL: `https://2026-2-oss-proj-warmplus-05.vercel.app`
   - Redirect URLs: `https://2026-2-oss-proj-warmplus-05.vercel.app/**`, `http://localhost:3000/**` (안 넣으면 로그인 뒤 엉뚱한 주소로 간다)
3. Allow anonymous sign-ins는 커뮤니티 글쓰기에 필요해서 켜 둔다. Allow manual linking은 쓰지 않으니 꺼도 된다

## 확인 순서
1. `cd src && npm run dev` → http://localhost:3000/me → 카카오 로그인
2. 돌아와서 계정 카드에 닉네임과 로그아웃이 보이는지
3. 커뮤니티에 글을 쓰고, 시크릿 창에서 같은 카카오로 로그인해 마이페이지 > 내가 쓴 글에 그 글이 보이는지
4. Supabase > Authentication > Users에서 그 사용자의 Provider가 kakao인지
5. 배포 뒤 프로덕션 주소에서 한 번 더 (카카오톡 안 브라우저에서도)

## 자주 나는 오류
| 오류 | 원인 |
| --- | --- |
| KOE205 | 동의항목 미설정 (특히 이메일 → 비즈 앱 전환) |
| KOE006 | 카카오 리다이렉트 URI가 Supabase 콜백 주소와 다름 |
| KOE004 | 카카오 로그인 사용 설정이 OFF |
| "지금은 카카오 로그인을 할 수 없어요" | Supabase에서 Kakao 제공자가 꺼져 있음 (브라우저 콘솔에 자세한 오류) |
| 돌아와서 "카카오 로그인을 하지 못했어요" | 클라이언트 시크릿이 틀림, 또는 Allow users without an email이 꺼짐 (브라우저 콘솔에 자세한 오류) |
| 콘솔에 "Unverified email with kakao" | 카카오 이메일이 인증되지 않은 계정. Supabase > Sign In / Providers > Email의 Confirm email을 끄면 된다 (이 앱은 이메일 가입을 쓰지 않음) |
| 로그인 뒤 localhost나 다른 주소로 감 | Supabase Site URL / Redirect URLs |

## 출시 전
- 닉네임·이메일을 받으니 개인정보 처리방침 페이지가 필요하다
