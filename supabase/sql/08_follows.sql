-- ============================================================
-- [08] 팔로우 / 팔로워
-- ------------------------------------------------------------
-- 사용법: 전체 복사 → Supabase SQL Editor → Run.
-- ============================================================

alter table public.profiles add column if not exists follower_count  int not null default 0;
alter table public.profiles add column if not exists following_count int not null default 0;

create table if not exists public.follows (
  follower_id  uuid not null references auth.users(id) on delete cascade default auth.uid(),
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
create index if not exists follows_following_idx on public.follows (following_id);
alter table public.follows enable row level security;

drop policy if exists "팔로우 조회" on public.follows;
create policy "팔로우 조회" on public.follows for select to authenticated using (true);
drop policy if exists "팔로우 하기" on public.follows;
create policy "팔로우 하기" on public.follows for insert to authenticated with check (follower_id = auth.uid());
drop policy if exists "언팔로우" on public.follows;
create policy "언팔로우" on public.follows for delete to authenticated using (follower_id = auth.uid());

-- 카운트 집계
create or replace function public.bump_follow_counts()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles set follower_count  = follower_count  + 1 where id = new.following_id;
    update public.profiles set following_count = following_count + 1 where id = new.follower_id;
  elsif tg_op = 'DELETE' then
    update public.profiles set follower_count  = greatest(follower_count  - 1, 0) where id = old.following_id;
    update public.profiles set following_count = greatest(following_count - 1, 0) where id = old.follower_id;
  end if;
  return null;
end $$;

drop trigger if exists trg_follow_counts on public.follows;
create trigger trg_follow_counts
  after insert or delete on public.follows
  for each row execute function public.bump_follow_counts();
