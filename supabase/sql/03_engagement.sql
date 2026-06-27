-- ============================================================
-- [03] 피드 상호작용 — 좋아요 / 댓글 (+ 카운트 자동 집계)
-- ------------------------------------------------------------
-- 사용법: 전체 복사 → Supabase SQL Editor → Run. (02_posts.sql 먼저)
-- ============================================================

-- posts 에 카운트 컬럼 (denormalized, 트리거가 유지)
alter table public.posts add column if not exists like_count    int not null default 0;
alter table public.posts add column if not exists comment_count int not null default 0;

-- ── 좋아요 ──────────────────────────────────────────────
create table if not exists public.post_likes (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table public.post_likes enable row level security;

drop policy if exists "좋아요 조회" on public.post_likes;
create policy "좋아요 조회" on public.post_likes for select to authenticated using (true);
drop policy if exists "좋아요 추가" on public.post_likes;
create policy "좋아요 추가" on public.post_likes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "좋아요 취소" on public.post_likes;
create policy "좋아요 취소" on public.post_likes for delete to authenticated using (user_id = auth.uid());

create or replace function public.bump_like_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set like_count = like_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end $$;

drop trigger if exists trg_like_count on public.post_likes;
create trigger trg_like_count
  after insert or delete on public.post_likes
  for each row execute function public.bump_like_count();

-- ── 댓글 ────────────────────────────────────────────────
create table if not exists public.post_comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  author_id   uuid not null references auth.users(id) on delete cascade default auth.uid(),
  author_name text,
  author_tier member_tier,
  content     text not null check (char_length(content) between 1 and 1000),
  created_at  timestamptz not null default now()
);
create index if not exists post_comments_post_idx on public.post_comments (post_id, created_at);
alter table public.post_comments enable row level security;

drop policy if exists "댓글 조회" on public.post_comments;
create policy "댓글 조회" on public.post_comments for select to authenticated using (true);
drop policy if exists "댓글 작성" on public.post_comments;
create policy "댓글 작성" on public.post_comments for insert to authenticated with check (author_id = auth.uid());
drop policy if exists "댓글 삭제" on public.post_comments;
create policy "댓글 삭제" on public.post_comments for delete to authenticated using (author_id = auth.uid());

-- 댓글 작성자 자동 채움
create or replace function public.fill_comment_author()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.author_id is null then new.author_id := auth.uid(); end if;
  select name, tier into new.author_name, new.author_tier
  from public.profiles where id = new.author_id;
  return new;
end $$;

drop trigger if exists comments_fill_author on public.post_comments;
create trigger comments_fill_author
  before insert on public.post_comments
  for each row execute function public.fill_comment_author();

-- 댓글 수 집계
create or replace function public.bump_comment_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end $$;

drop trigger if exists trg_comment_count on public.post_comments;
create trigger trg_comment_count
  after insert or delete on public.post_comments
  for each row execute function public.bump_comment_count();
