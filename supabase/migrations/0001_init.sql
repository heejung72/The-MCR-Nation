-- =====================================================================
-- THE MCR NATION — 0001 초기 스키마
-- Supabase 대시보드 → SQL Editor에 전체를 붙여넣고 Run. 여러 번 실행해도 안전하다.
-- 권한은 모두 RLS로 서버에서 강제한다(브라우저에서 우회 불가).
-- =====================================================================

-- ---------- 시민 프로필 (익명/카카오 공통) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null check (char_length(btrim(nickname)) between 1 and 20),
  kind text not null default 'anonymous' check (kind in ('anonymous', 'kakao')),
  role text not null default 'citizen' check (role in ('citizen', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.random_nickname()
returns text language sql volatile set search_path = '' as $$
  select (array['잔향의','낯선','느린','작은','고요한','먼 곳의'])[1 + floor(random() * 6)::int]
    || ' ' || (array['검은 사슴','밀 이삭','회색 나팔','붉은 검인','콘크리트 별','밤의 행진'])[1 + floor(random() * 6)::int]
    || ' ' || (100 + floor(random() * 900)::int)::text;
$$;

-- 가입(익명 로그인 또는 카카오 로그인) 직후 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  display_name text := nullif(btrim(coalesce(
    meta ->> 'nickname', meta ->> 'name', meta ->> 'full_name',
    meta ->> 'preferred_username', meta ->> 'user_name', '')), '');
begin
  insert into public.profiles (id, nickname, kind)
  values (
    new.id,
    left(coalesce(display_name, public.random_nickname()), 20),
    case when coalesce(new.is_anonymous, false) then 'anonymous' else 'kakao' end
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- 게시글 / 댓글 ----------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  board text not null check (board in ('general', 'looks', 'lyrics', 'companions')),
  title text not null check (char_length(btrim(title)) between 1 and 80),
  body text not null check (char_length(btrim(body)) between 1 and 1600),
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  author_name text not null default '',
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now()
);
create index if not exists posts_board_created_idx on public.posts (board, created_at desc);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 300),
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  author_name text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists comments_post_idx on public.comments (post_id, created_at);

-- 작성자 정보는 클라이언트 값을 무시하고 서버에서 채운다(사칭 방지).
-- 별칭을 나중에 바꿔도 기존 기록의 표시 이름은 유지된다.
create or replace function public.set_author()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.author_id := auth.uid();
  select p.nickname into new.author_name from public.profiles p where p.id = auth.uid();
  if new.author_name is null then
    raise exception '시민 등록 후 작성할 수 있습니다.' using errcode = '42501';
  end if;
  return new;
end $$;

drop trigger if exists posts_set_author on public.posts;
create trigger posts_set_author before insert on public.posts
  for each row execute function public.set_author();
drop trigger if exists comments_set_author on public.comments;
create trigger comments_set_author before insert on public.comments
  for each row execute function public.set_author();

-- ---------- 신고 ----------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment')),
  target_id uuid not null,
  reason text not null check (char_length(btrim(reason)) between 1 and 300),
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);

-- ---------- 셋리스트 월드컵 집계 (1인 1표, 다시 하면 갱신) ----------
create table if not exists public.bracket_votes (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  champion text not null check (char_length(btrim(champion)) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.cast_bracket_vote(song text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception '시민 등록 후 투표할 수 있습니다.' using errcode = '42501';
  end if;
  insert into public.bracket_votes (user_id, champion)
  values (auth.uid(), btrim(song))
  on conflict (user_id) do update set champion = excluded.champion, updated_at = now();
end $$;

create or replace function public.get_bracket_results()
returns table (champion text, votes bigint)
language sql stable security definer set search_path = '' as $$
  select v.champion, count(*) as votes
  from public.bracket_votes v
  group by v.champion
  order by votes desc, v.champion;
$$;

revoke execute on function public.cast_bracket_vote(text) from public, anon;
grant execute on function public.cast_bracket_vote(text) to authenticated;
grant execute on function public.get_bracket_results() to anon, authenticated;

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reports enable row level security;
alter table public.bracket_votes enable row level security;  -- 정책 없음: RPC로만 접근

-- profiles: 누구나 별칭 열람, 본인은 별칭만 수정(역할·종류는 변경 불가)
drop policy if exists "profiles are public" on public.profiles;
create policy "profiles are public" on public.profiles for select using (true);
drop policy if exists "users rename themselves" on public.profiles;
create policy "users rename themselves" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from anon, authenticated;
grant update (nickname) on public.profiles to authenticated;

-- posts: 공개 글은 누구나, 숨김 글은 작성자·관리자만 / 작성은 등록 시민 / 삭제는 작성자·관리자 / 숨김 처리는 관리자
drop policy if exists "read published posts" on public.posts;
create policy "read published posts" on public.posts for select
  using (status = 'published' or author_id = auth.uid() or public.is_admin());
drop policy if exists "citizens write posts" on public.posts;
create policy "citizens write posts" on public.posts for insert to authenticated
  with check (author_id = auth.uid());
drop policy if exists "authors delete posts" on public.posts;
create policy "authors delete posts" on public.posts for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());
drop policy if exists "admins moderate posts" on public.posts;
create policy "admins moderate posts" on public.posts for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- comments: 보이는 글의 댓글만 열람/작성
drop policy if exists "read comments" on public.comments;
create policy "read comments" on public.comments for select
  using (exists (select 1 from public.posts p where p.id = post_id));
drop policy if exists "citizens write comments" on public.comments;
create policy "citizens write comments" on public.comments for insert to authenticated
  with check (author_id = auth.uid() and exists (select 1 from public.posts p where p.id = post_id));
drop policy if exists "authors delete comments" on public.comments;
create policy "authors delete comments" on public.comments for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- reports: 등록 시민이 접수, 관리자만 열람·처리
drop policy if exists "citizens report" on public.reports;
create policy "citizens report" on public.reports for insert to authenticated
  with check (reporter_id = auth.uid());
drop policy if exists "admins read reports" on public.reports;
create policy "admins read reports" on public.reports for select to authenticated
  using (public.is_admin());
drop policy if exists "admins handle reports" on public.reports;
create policy "admins handle reports" on public.reports for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 관리자 지정(카카오 로그인 후 본인 id 확인 → 아래 실행):
-- update public.profiles set role = 'admin' where id = '<your-user-uuid>';
