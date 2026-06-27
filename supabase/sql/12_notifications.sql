-- ============================================================
-- [12] 알림 (팔로우 / 좋아요 / 댓글)
-- ------------------------------------------------------------
-- 사용법: 전체 복사 → Supabase SQL Editor → Run.
--   (08_follows, 03_engagement 이후)
-- ============================================================

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,  -- 받는 사람
  actor_id   uuid references auth.users(id) on delete cascade,           -- 행동한 사람
  type       text not null,            -- follow | like | comment
  post_id    uuid,                     -- like/comment 대상 글
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
alter table public.notifications enable row level security;

-- 본인 알림만 조회/수정(읽음)/삭제 (insert는 트리거가 security definer로 처리)
drop policy if exists "내 알림 조회" on public.notifications;
create policy "내 알림 조회" on public.notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists "내 알림 수정" on public.notifications;
create policy "내 알림 수정" on public.notifications for update to authenticated using (user_id = auth.uid());
drop policy if exists "내 알림 삭제" on public.notifications;
create policy "내 알림 삭제" on public.notifications for delete to authenticated using (user_id = auth.uid());

-- ── 팔로우 알림 ──
create or replace function public.notify_follow()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, actor_id, type)
  values (new.following_id, new.follower_id, 'follow');
  return null;
end $$;
drop trigger if exists trg_notify_follow on public.follows;
create trigger trg_notify_follow after insert on public.follows
  for each row execute function public.notify_follow();

-- ── 좋아요 알림 ──
create or replace function public.notify_like()
returns trigger language plpgsql security definer set search_path = public as $$
declare author uuid;
begin
  select author_id into author from public.posts where id = new.post_id;
  if author is not null and author <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, post_id)
    values (author, new.user_id, 'like', new.post_id);
  end if;
  return null;
end $$;
drop trigger if exists trg_notify_like on public.post_likes;
create trigger trg_notify_like after insert on public.post_likes
  for each row execute function public.notify_like();

-- ── 댓글 알림 ──
create or replace function public.notify_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare author uuid;
begin
  select author_id into author from public.posts where id = new.post_id;
  if author is not null and author <> new.author_id then
    insert into public.notifications (user_id, actor_id, type, post_id)
    values (author, new.author_id, 'comment', new.post_id);
  end if;
  return null;
end $$;
drop trigger if exists trg_notify_comment on public.post_comments;
create trigger trg_notify_comment after insert on public.post_comments
  for each row execute function public.notify_comment();
