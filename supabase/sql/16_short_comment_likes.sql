-- ============================================================
-- [16] 숏폼 댓글 좋아요
-- ------------------------------------------------------------
-- 사용법: 전체 복사 → Supabase SQL Editor → Run. (15_short_comments 이후)
-- ============================================================

alter table public.short_comments add column if not exists like_count int not null default 0;

create table if not exists public.short_comment_likes (
  comment_id uuid not null references public.short_comments(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);
alter table public.short_comment_likes enable row level security;

drop policy if exists "숏폼댓글좋아요 조회" on public.short_comment_likes;
create policy "숏폼댓글좋아요 조회" on public.short_comment_likes for select to authenticated using (true);
drop policy if exists "숏폼댓글좋아요 추가" on public.short_comment_likes;
create policy "숏폼댓글좋아요 추가" on public.short_comment_likes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "숏폼댓글좋아요 취소" on public.short_comment_likes;
create policy "숏폼댓글좋아요 취소" on public.short_comment_likes for delete to authenticated using (user_id = auth.uid());

create or replace function public.bump_short_comment_like_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.short_comments set like_count = like_count + 1 where id = new.comment_id;
  elsif tg_op = 'DELETE' then
    update public.short_comments set like_count = greatest(like_count - 1, 0) where id = old.comment_id;
  end if;
  return null;
end $$;

drop trigger if exists trg_short_comment_like_count on public.short_comment_likes;
create trigger trg_short_comment_like_count
  after insert or delete on public.short_comment_likes
  for each row execute function public.bump_short_comment_like_count();
