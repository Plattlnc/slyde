-- ============================================================
-- [04] 공유 횟수 (share_count)
-- ------------------------------------------------------------
-- 사용법: 전체 복사 → Supabase SQL Editor → Run. (03_engagement.sql 이후)
-- ============================================================

alter table public.posts add column if not exists share_count int not null default 0;

-- 누구나(로그인) 공유 시 카운트만 +1 (posts 전체 UPDATE 권한은 주지 않고 함수로 제한)
create or replace function public.increment_share(p_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.posts set share_count = share_count + 1 where id = p_id;
$$;

grant execute on function public.increment_share(uuid) to authenticated;
