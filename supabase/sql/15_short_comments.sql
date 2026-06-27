-- ============================================================
-- [15] 숏폼 댓글
-- ------------------------------------------------------------
-- 사용법: 전체 복사 → Supabase SQL Editor → Run. (05_shorts 이후)
-- ============================================================

alter table public.shorts add column if not exists comment_count int not null default 0;

create table if not exists public.short_comments (
  id          uuid primary key default gen_random_uuid(),
  short_id    uuid not null references public.shorts(id) on delete cascade,
  author_id   uuid not null references auth.users(id) on delete cascade default auth.uid(),
  author_name text,
  content     text not null check (char_length(content) between 1 and 1000),
  created_at  timestamptz not null default now()
);
create index if not exists short_comments_short_idx on public.short_comments (short_id, created_at);
alter table public.short_comments enable row level security;

drop policy if exists "숏폼댓글 조회" on public.short_comments;
create policy "숏폼댓글 조회" on public.short_comments for select to authenticated using (true);
drop policy if exists "숏폼댓글 작성" on public.short_comments;
create policy "숏폼댓글 작성" on public.short_comments for insert to authenticated with check (author_id = auth.uid());
drop policy if exists "숏폼댓글 삭제" on public.short_comments;
create policy "숏폼댓글 삭제" on public.short_comments for delete to authenticated using (author_id = auth.uid());

-- 작성자 이름 자동 채움
create or replace function public.fill_short_comment_author()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.author_id is null then new.author_id := auth.uid(); end if;
  select name into new.author_name from public.profiles where id = new.author_id;
  return new;
end $$;
drop trigger if exists short_comments_fill_author on public.short_comments;
create trigger short_comments_fill_author
  before insert on public.short_comments
  for each row execute function public.fill_short_comment_author();

-- 댓글 수 집계
create or replace function public.bump_short_comment_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.shorts set comment_count = comment_count + 1 where id = new.short_id;
  elsif tg_op = 'DELETE' then
    update public.shorts set comment_count = greatest(comment_count - 1, 0) where id = old.short_id;
  end if;
  return null;
end $$;
drop trigger if exists trg_short_comment_count on public.short_comments;
create trigger trg_short_comment_count
  after insert or delete on public.short_comments
  for each row execute function public.bump_short_comment_count();
