# 서버(Supabase)에 저장하는 데이터

테이블과 접근 규칙(RLS)은 `src/supabase/migrations/`에 있다. 접근 규칙 시험은 `src/supabase/rls.integration.test.ts`.

| 테이블 | 무엇 | 누가 쓰고 읽나 |
| --- | --- | --- |
| `posts` | 이야기 광장 글 | 누구나 읽음, 내 계정(익명 포함)으로 쓰고 내 글만 지움 |
| `free_posts` | 자유게시판 글 | 위와 같음 |
| `events` | 이용 기록 (아래) | 앱은 남기기만, 읽기는 팀이 대시보드에서 |
| `profiles`, `mood_entries`, `test_results`, `saved_songs` | 카카오 회원의 닉네임·생일, 마음 기록, 테스트 결과, 저장한 노래 | 카카오 회원 본인만 (익명 계정은 못 씀) |

오목이 대화와 오목이 메모는 서버에 저장하지 않는다 (기기에만). 카카오 회원 기록을 언제 어떻게 맞추는지는 `kakao-login.md`의 '기록 맞추기'. 사용자에게 보여 주는 안내는 `/privacy`(`src/app/privacy/page.tsx`)이고, 저장하는 데이터가 바뀌면 같이 고친다.

## 이용 기록 (events)

배포본에서만 남긴다 (`src/lib/events.ts`의 `track`). 사람 대신 기기마다 만든 무작위 id(`device_id`, 브라우저의 `omok:device-id`)로 구분하고, 메모·대화·글 내용은 담지 않는다.

| name | 언제 | props |
| --- | --- | --- |
| `page_view` | 화면을 열 때마다 | `path` |
| `test_complete` | 심리테스트 결과가 나왔을 때 | `testId`, `resultId`, `mood`(있으면) |
| `mood_record` | 오늘의 마음 날씨를 기록했을 때 | `mood`, `source` |
| `song_create` | 노래 만들기를 맡겼을 때 | `kind` (`words` 감정 단어 / `test` 테스트 유형) |
| `song_save` | 만든 노래를 마이페이지에 저장했을 때 | 없음 |
| `post_create` | 글을 올렸을 때 | `board` (`plaza` / `free`), `bgm` (노래를 붙였는지) |
| `chat_send` | 오목이에게 말을 걸 때 | 없음 |
| `login` | 이 기기에서 카카오 계정 기록을 처음 맞출 때 | `provider` |

새 기록 이름을 쓰려면 `events.name`의 허용 목록(마이그레이션)과 `EventName` 타입을 같이 늘린다.

## KPI 뽑기 (Supabase 대시보드 › SQL Editor)

날짜는 한국 시간으로 자른다.

```sql
-- 유입: 날마다 들어온 기기 수
select (created_at at time zone 'Asia/Seoul')::date as day, count(distinct device_id) as devices
from events where name = 'page_view'
group by 1 order by 1 desc;

-- 체류: 기기별 하루 첫 화면~마지막 화면 사이 시간(분)의 평균
select day, round(avg(extract(epoch from last_at - first_at) / 60)::numeric, 1) as avg_minutes
from (
  select device_id, (created_at at time zone 'Asia/Seoul')::date as day, min(created_at) as first_at, max(created_at) as last_at
  from events where name = 'page_view' group by 1, 2
) per_day
group by day order by day desc;

-- 재방문: 처음 온 날로부터 7일 뒤에도 온 기기 비율 (D7)
with first_day as (
  select device_id, min((created_at at time zone 'Asia/Seoul')::date) as d0 from events group by 1
)
select f.d0, count(*) as new_devices,
       count(*) filter (where exists (
         select 1 from events e where e.device_id = f.device_id and (e.created_at at time zone 'Asia/Seoul')::date = f.d0 + 7
       )) as back_on_d7
from first_day f group by 1 order by 1 desc;

-- 전환: 최근 7일 동안 각 단계를 한 번이라도 한 기기 수
select name, count(distinct device_id) as devices
from events
where created_at > now() - interval '7 days'
  and name in ('page_view', 'test_complete', 'song_create', 'song_save', 'post_create', 'login')
group by 1 order by 2 desc;

-- 심리테스트 결과 분포
select props ->> 'testId' as test, props ->> 'resultId' as result, count(*)
from events where name = 'test_complete'
group by 1, 2 order by 3 desc;

-- 오늘의 마음 날씨 감정 분포
select props ->> 'mood' as mood, count(*) from events where name = 'mood_record' group by 1 order by 2 desc;
```
