-- ─────────────────────────────────────────────────────────────
-- 1. 카카오로 로그인한 사용자의 기록
--    기기를 바꾸거나 브라우저 기록이 지워져도 다시 로그인하면 돌아온다.
--    익명 계정(글쓰기용)의 기록은 받지 않는다: 같은 브라우저에 묶여 있어 다시 찾을 수 없는 기록이라서.
--    오목이 대화는 여기에 두지 않는다 (기기에만 저장).
-- ─────────────────────────────────────────────────────────────

create table public.profiles (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  nickname text check (char_length(nickname) between 1 and 12),
  birth_date date,
  -- 태어난 시각 'HH:MM' (모르면 비워 둔다)
  birth_time text check (birth_time ~ '^([01]\d|2[0-3]):[0-5]\d$'),
  updated_at timestamptz not null default now(),
  check (birth_time is null or birth_date is not null)
);

-- 마음 유리병의 구슬: 하루 하나
create table public.mood_entries (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  mood text not null check (mood in ('joy', 'flutter', 'calm', 'tired', 'sad', 'anxious', 'angry')),
  -- daily: 오늘의 마음 날씨 테스트, checkin: 직접 고르기, test: 심리테스트 결과
  source text not null check (source in ('daily', 'checkin', 'test')),
  test_id text check (char_length(test_id) between 1 and 64),
  note text check (char_length(note) <= 200),
  at timestamptz not null,
  primary key (user_id, day)
);

create table public.test_results (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  test_id text not null check (char_length(test_id) between 1 and 64),
  result_id text not null check (char_length(result_id) between 1 and 64),
  at timestamptz not null,
  primary key (user_id, test_id, at)
);

-- 마이페이지에 저장한 노래만 (저장하지 않은 곡은 기기에만 잠깐 있다)
create table public.saved_songs (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 100),
  title text not null check (char_length(title) between 1 and 30),
  audio_url text not null check (audio_url ~ '^(https://|/samples/)'),
  duration real check (duration > 0),
  temporary boolean not null default false,
  mode text not null check (mode in ('sample', 'suno')),
  -- 무엇으로 만들었는지: {"kind":"words","words":[…]} 또는 {"kind":"test","testId":…,"resultId":…}
  source jsonb not null check (jsonb_typeof(source) = 'object'),
  created_at timestamptz not null,
  primary key (user_id, id)
);

alter table public.profiles enable row level security;
alter table public.mood_entries enable row level security;
alter table public.test_results enable row level security;
alter table public.saved_songs enable row level security;

create policy "카카오 회원은 내 기록만 다룬다" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = user_id and ((select auth.jwt()) ->> 'is_anonymous')::boolean is not true)
  with check ((select auth.uid()) = user_id and ((select auth.jwt()) ->> 'is_anonymous')::boolean is not true);
create policy "카카오 회원은 내 기록만 다룬다" on public.mood_entries
  for all to authenticated
  using ((select auth.uid()) = user_id and ((select auth.jwt()) ->> 'is_anonymous')::boolean is not true)
  with check ((select auth.uid()) = user_id and ((select auth.jwt()) ->> 'is_anonymous')::boolean is not true);
create policy "카카오 회원은 내 기록만 다룬다" on public.test_results
  for all to authenticated
  using ((select auth.uid()) = user_id and ((select auth.jwt()) ->> 'is_anonymous')::boolean is not true)
  with check ((select auth.uid()) = user_id and ((select auth.jwt()) ->> 'is_anonymous')::boolean is not true);
create policy "카카오 회원은 내 기록만 다룬다" on public.saved_songs
  for all to authenticated
  using ((select auth.uid()) = user_id and ((select auth.jwt()) ->> 'is_anonymous')::boolean is not true)
  with check ((select auth.uid()) = user_id and ((select auth.jwt()) ->> 'is_anonymous')::boolean is not true);

revoke all on public.profiles, public.mood_entries, public.test_results, public.saved_songs from anon, authenticated;
grant select, insert, update, delete on public.profiles, public.mood_entries, public.test_results, public.saved_songs to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 2. 자유게시판: 이야기 광장(posts)과 같은 규칙. 누구나 읽고, 익명 계정으로도 쓴다
-- ─────────────────────────────────────────────────────────────

create table public.free_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 12),
  title text not null check (char_length(title) between 1 and 40),
  content text not null check (char_length(content) between 1 and 1000),
  bgm_title text check (char_length(bgm_title) <= 80),
  bgm_url text check (bgm_url ~ '^(https?://|/samples/)'),
  created_at timestamptz not null default now(),
  check ((bgm_url is null) = (bgm_title is null))
);

create index free_posts_created_at_idx on public.free_posts (created_at desc);
create index free_posts_user_id_idx on public.free_posts (user_id);

alter table public.free_posts enable row level security;

create policy "글은 누구나 읽을 수 있다" on public.free_posts
  for select to anon, authenticated using (true);
create policy "내 계정으로만 글을 쓴다" on public.free_posts
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "내 글만 지운다" on public.free_posts
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.free_posts from anon, authenticated;
grant select on public.free_posts to anon, authenticated;
grant insert (nickname, title, content, bgm_title, bgm_url) on public.free_posts to authenticated;
grant delete on public.free_posts to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 3. 이용 기록 (KPI: 유입·체류·전환). 모든 사용자
--    사람 대신 기기마다 만든 무작위 id로 구분하고, 메모·대화 같은 글 내용은 담지 않는다.
--    앱은 남기기만 하고, 읽기는 팀이 대시보드(SQL)에서 한다.
-- ─────────────────────────────────────────────────────────────

create table public.events (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null,
  name text not null check (name in ('page_view', 'test_complete', 'mood_record', 'song_create', 'song_save', 'post_create', 'chat_send', 'login')),
  props jsonb not null default '{}' check (jsonb_typeof(props) = 'object' and pg_column_size(props) <= 512),
  created_at timestamptz not null default now()
);

create index events_name_created_at_idx on public.events (name, created_at);
create index events_device_id_created_at_idx on public.events (device_id, created_at);

alter table public.events enable row level security;

create policy "누구나 기록을 남기기만 한다" on public.events
  for insert to anon, authenticated with check (true);

revoke all on public.events from anon, authenticated;
grant insert (device_id, name, props) on public.events to anon, authenticated;
