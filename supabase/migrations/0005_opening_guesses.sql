-- =====================================================================
-- THE MCR NATION — 0005 오프닝 밴드 추측하기
-- 시민 1인 1추측(다시 입력하면 교체). 대소문자·띄어쓰기가 달라도 같은 밴드로 집계.
-- =====================================================================
create table if not exists public.opening_guesses (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  band text not null check (char_length(btrim(band)) between 1 and 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.opening_guesses enable row level security;  -- RPC로만 접근

create or replace function public.opening_band_key(band text)
returns text language sql immutable set search_path = '' as $$
  select lower(regexp_replace(btrim(band), '[[:space:]]+', '', 'g'));
$$;

create or replace function public.set_opening_guess(band text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception '시민 등록 후 참여할 수 있습니다.' using errcode = '42501';
  end if;
  insert into public.opening_guesses (user_id, band)
  values (auth.uid(), btrim(regexp_replace(band, '[[:space:]]+', ' ', 'g')))
  on conflict (user_id) do update set band = excluded.band, updated_at = now();
end $$;

create or replace function public.get_my_opening_guess()
returns text language sql stable security definer set search_path = '' as $$
  select band from public.opening_guesses where user_id = auth.uid();
$$;

create or replace function public.get_opening_guess_results()
returns table (band text, votes bigint, total bigint)
language sql stable security definer set search_path = '' as $$
  select mode() within group (order by g.band) as band,
         count(*) as votes,
         (select count(*) from public.opening_guesses) as total
  from public.opening_guesses g
  group by public.opening_band_key(g.band)
  order by votes desc, band
  limit 30;
$$;

revoke execute on function public.set_opening_guess(text) from public, anon;
revoke execute on function public.get_my_opening_guess() from public, anon;
grant execute on function public.set_opening_guess(text) to authenticated;
grant execute on function public.get_my_opening_guess() to authenticated;
grant execute on function public.get_opening_guess_results() to anon, authenticated;
