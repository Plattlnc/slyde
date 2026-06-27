-- ============================================================
-- [02] SNS 피드 글 (posts)
-- ------------------------------------------------------------
-- 사용법: 이 파일 "전체" 복사 → Supabase SQL Editor → 붙여넣기 → Run.
--        (01_auth_profiles.sql 먼저 실행돼 있어야 함)
-- ============================================================

create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references auth.users(id) on delete cascade default auth.uid(),
  author_name text,                         -- 작성 시 자동 채움
  author_tier member_tier,                  -- 작성 시 자동 채움
  content     text not null check (char_length(content) between 1 and 1000),
  created_at  timestamptz not null default now()
);

create index if not exists posts_created_idx on public.posts (created_at desc);

-- RLS
alter table public.posts enable row level security;

-- 읽기: 로그인한 사용자는 전체 피드 조회 가능
drop policy if exists "피드 조회" on public.posts;
create policy "피드 조회"
  on public.posts for select to authenticated using (true);

-- 작성: 본인 글만
drop policy if exists "본인 글 작성" on public.posts;
create policy "본인 글 작성"
  on public.posts for insert to authenticated with check (author_id = auth.uid());

-- 삭제: 본인 글만
drop policy if exists "본인 글 삭제" on public.posts;
create policy "본인 글 삭제"
  on public.posts for delete to authenticated using (author_id = auth.uid());

-- 작성 시 작성자 이름/등급을 profiles 에서 자동 채움 (클라 위조 방지)
create or replace function public.fill_post_author()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.author_id is null then new.author_id := auth.uid(); end if;
  select name, tier into new.author_name, new.author_tier
  from public.profiles where id = new.author_id;
  return new;
end $$;

drop trigger if exists posts_fill_author on public.posts;
create trigger posts_fill_author
  before insert on public.posts
  for each row execute function public.fill_post_author();

-- ✅ 확인:  select id, author_name, author_tier, content, created_at from public.posts order by created_at desc;
