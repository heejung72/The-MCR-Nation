-- =====================================================================
-- THE MCR NATION — 0002 카카오 로그인도 랜덤 별칭으로 시작
-- 카카오 닉네임은 실명인 경우가 많아, 공개 게시판에 노출되지 않도록 한다.
-- 익명 로그인은 앱이 보낸 랜덤 별칭(nickname)을 그대로 사용한다.
-- =====================================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  requested text := case
    when coalesce(new.is_anonymous, false)
      then nullif(btrim(coalesce(new.raw_user_meta_data ->> 'nickname', '')), '')
  end;
begin
  insert into public.profiles (id, nickname, kind)
  values (
    new.id,
    left(coalesce(requested, public.random_nickname()), 20),
    case when coalesce(new.is_anonymous, false) then 'anonymous' else 'kakao' end
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- 이미 카카오 닉네임으로 만들어진 프로필은 랜덤 별칭으로 교체
update public.profiles set nickname = public.random_nickname() where kind = 'kakao';
