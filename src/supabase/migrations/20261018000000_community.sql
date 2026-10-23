-- 커뮤니티 글. 로그인 없이 쓰는 익명 계정(Supabase anonymous sign-in)으로 글쓴이를 구분한다
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 12),
  -- 글쓰기에서 오목이가 추천한 주제 (받지 않았으면 비워 둔다)
  topic text check (char_length(topic) <= 100),
  content text not null check (char_length(content) between 1 and 500),
  -- 배경음악: 저장소에 올린 노래 주소 또는 앱에 들어 있는 샘플 곡(/samples/...)
  bgm_title text check (char_length(bgm_title) <= 80),
  bgm_url text check (bgm_url ~ '^(https?://|/samples/)'),
  created_at timestamptz not null default now(),
  check ((bgm_url is null) = (bgm_title is null))
);

create index posts_created_at_idx on public.posts (created_at desc);
create index posts_user_id_idx on public.posts (user_id);

alter table public.posts enable row level security;

create policy "글은 누구나 읽을 수 있다" on public.posts
  for select to anon, authenticated using (true);
create policy "내 계정으로만 글을 쓴다" on public.posts
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "내 글만 지운다" on public.posts
  for delete to authenticated using ((select auth.uid()) = user_id);

-- 글쓴이·작성 시각은 서버가 정한다: 글 내용 칸만 쓸 수 있게 하고, 고치기는 막는다
revoke all on public.posts from anon, authenticated;
grant select on public.posts to anon, authenticated;
grant insert (nickname, topic, content, bgm_title, bgm_url) on public.posts to authenticated;
grant delete on public.posts to authenticated;

-- 작곡한 노래 파일. Suno 쪽 파일은 2주쯤 뒤 지워져서, 완성되면 서버(service role)가 여기로 옮긴다.
-- 커뮤니티 배경음악으로 다른 사람도 들어야 하므로 공개 버킷
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('songs', 'songs', true, 20971520, array['audio/mpeg'])
on conflict (id) do nothing;
