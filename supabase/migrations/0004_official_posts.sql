-- =====================================================================
-- THE MCR NATION — 0004 공식 소식(인스타그램) 목록
-- 운영자가 사이트에서 게시물 링크를 추가/삭제한다. 표시는 Instagram 공식 임베드.
-- =====================================================================
create table if not exists public.official_posts (
  shortcode text primary key check (shortcode ~ '^[A-Za-z0-9_-]{5,40}$'),
  account text not null default 'ualive_stage' check (account ~ '^[A-Za-z0-9._]{1,30}$'),
  note text check (note is null or char_length(note) <= 120),
  pinned boolean not null default false,
  added_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.official_posts enable row level security;

drop policy if exists "official posts are public" on public.official_posts;
create policy "official posts are public" on public.official_posts for select using (true);
drop policy if exists "admins add official posts" on public.official_posts;
create policy "admins add official posts" on public.official_posts for insert to authenticated with check (public.is_admin());
drop policy if exists "admins edit official posts" on public.official_posts;
create policy "admins edit official posts" on public.official_posts for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins remove official posts" on public.official_posts;
create policy "admins remove official posts" on public.official_posts for delete to authenticated using (public.is_admin());

-- 초기 게시물 (운영자가 지정한 순서: 위가 최신으로 표시)
insert into public.official_posts (shortcode, note, pinned, created_at) values
  ('DSd_Z2bk0yj', null, false, now()),
  ('DfO8fhGnfzP', '공연 당일 타임테이블', true, now() - interval '1 minute'),
  ('DfOZpdVnU9T', null, false, now() - interval '2 minutes'),
  ('DfD_c5qHYFi', null, false, now() - interval '3 minutes'),
  ('De-2TqLncBa', null, false, now() - interval '4 minutes'),
  ('Dd0K1ndHSxf', null, false, now() - interval '5 minutes')
on conflict (shortcode) do nothing;
