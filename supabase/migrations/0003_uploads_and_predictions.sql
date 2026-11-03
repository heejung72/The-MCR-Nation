-- =====================================================================
-- THE MCR NATION — 0003 게시판 확장 · 사진 업로드 · 셋리스트 예측
-- =====================================================================

-- ---------- 게시판 분류 확장 ----------
-- notice(정부 공지·관리자 전용) talk(MCR TALK) general creations(팬 창작) lyrics(가사 해석)
-- companions(동행) looks(콘서트룩·사진 필수) after(공연 후기)
alter table public.posts drop constraint if exists posts_board_check;
alter table public.posts add constraint posts_board_check
  check (board in ('notice', 'talk', 'general', 'creations', 'lyrics', 'companions', 'looks', 'after'));
alter table public.posts add column if not exists image_path text;
alter table public.posts drop constraint if exists posts_image_path_check;
alter table public.posts add constraint posts_image_path_check
  check (image_path is null or char_length(image_path) between 1 and 300);
create index if not exists posts_created_idx on public.posts (created_at desc);

-- 공지는 관리자만, 콘서트룩은 사진 필수, 사진은 본인 폴더 경로만
drop policy if exists "citizens write posts" on public.posts;
create policy "citizens write posts" on public.posts for insert to authenticated
  with check (
    author_id = auth.uid()
    and (board <> 'notice' or public.is_admin())
    and (board <> 'looks' or image_path is not null)
    and (image_path is null or image_path like auth.uid()::text || '/%')
  );

-- ---------- 사진 저장소 (공개 읽기, 본인 폴더에만 업로드) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('citizen-uploads', 'citizen-uploads', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "citizens upload own images" on storage.objects;
create policy "citizens upload own images" on storage.objects for insert to authenticated
  with check (bucket_id = 'citizen-uploads' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "citizens delete own images" on storage.objects;
create policy "citizens delete own images" on storage.objects for delete to authenticated
  using (bucket_id = 'citizen-uploads' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ---------- 셋리스트 예측 (1인 최대 20곡, 다시 저장하면 교체) ----------
create table if not exists public.setlist_predictions (
  user_id uuid not null references public.profiles (id) on delete cascade,
  song text not null check (char_length(btrim(song)) between 1 and 120),
  created_at timestamptz not null default now(),
  primary key (user_id, song)
);
alter table public.setlist_predictions enable row level security;  -- RPC로만 접근

create or replace function public.set_setlist_prediction(songs text[])
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception '시민 등록 후 예측할 수 있습니다.' using errcode = '42501';
  end if;
  if coalesce(array_length(songs, 1), 0) > 20 then
    raise exception '최대 20곡까지 고를 수 있습니다.' using errcode = '22023';
  end if;
  delete from public.setlist_predictions where user_id = auth.uid();
  insert into public.setlist_predictions (user_id, song)
  select auth.uid(), btrim(s) from unnest(songs) as s where btrim(s) <> ''
  on conflict do nothing;
end $$;

create or replace function public.get_my_setlist_prediction()
returns setof text language sql stable security definer set search_path = '' as $$
  select song from public.setlist_predictions where user_id = auth.uid() order by created_at, song;
$$;

create or replace function public.get_setlist_prediction_results()
returns table (song text, votes bigint, voters bigint)
language sql stable security definer set search_path = '' as $$
  select p.song, count(*) as votes,
         (select count(distinct user_id) from public.setlist_predictions) as voters
  from public.setlist_predictions p
  group by p.song
  order by votes desc, p.song;
$$;

revoke execute on function public.set_setlist_prediction(text[]) from public, anon;
revoke execute on function public.get_my_setlist_prediction() from public, anon;
grant execute on function public.set_setlist_prediction(text[]) to authenticated;
grant execute on function public.get_my_setlist_prediction() to authenticated;
grant execute on function public.get_setlist_prediction_results() to anon, authenticated;
