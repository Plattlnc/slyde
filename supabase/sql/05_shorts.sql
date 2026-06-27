-- ============================================================
-- [05] 숏폼 (틱톡 스타일 사진/영상)
-- ------------------------------------------------------------
-- 사용법: 전체 복사 → Supabase SQL Editor → Run.
-- ============================================================

-- ── 미디어 저장용 Storage 버킷 (공개 읽기) ──────────────
insert into storage.buckets (id, name, public)
values ('shorts', 'shorts', true)
on conflict (id) do nothing;

drop policy if exists "숏폼 미디어 읽기" on storage.objects;
create policy "숏폼 미디어 읽기" on storage.objects
  for select using (bucket_id = 'shorts');

-- 업로드/삭제는 본인 폴더(uid/...)만
drop policy if exists "숏폼 미디어 업로드" on storage.objects;
create policy "숏폼 미디어 업로드" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'shorts' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "숏폼 미디어 삭제" on storage.objects;
create policy "숏폼 미디어 삭제" on storage.objects
  for delete to authenticated
  using (bucket_id = 'shorts' and (storage.foldername(name))[1] = auth.uid()::text);

-- ── 숏폼 테이블 ─────────────────────────────────────────
create table if not exists public.shorts (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references auth.users(id) on delete cascade default auth.uid(),
  author_name text,
  author_tier member_tier,
  media_url   text not null,
  media_type  text not null check (media_type in ('image', 'video')),
  caption     text,
  like_count  int  not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists shorts_created_idx on public.shorts (created_at desc);
alter table public.shorts enable row level security;

drop policy if exists "숏폼 조회" on public.shorts;
create policy "숏폼 조회" on public.shorts for select to authenticated using (true);
drop policy if exists "숏폼 작성" on public.shorts;
create policy "숏폼 작성" on public.shorts for insert to authenticated with check (author_id = auth.uid());
drop policy if exists "숏폼 삭제" on public.shorts;
create policy "숏폼 삭제" on public.shorts for delete to authenticated using (author_id = auth.uid());

-- 작성자 자동 채움
create or replace function public.fill_short_author()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.author_id is null then new.author_id := auth.uid(); end if;
  select name, tier into new.author_name, new.author_tier
  from public.profiles where id = new.author_id;
  return new;
end $$;

drop trigger if exists shorts_fill_author on public.shorts;
create trigger shorts_fill_author
  before insert on public.shorts
  for each row execute function public.fill_short_author();

-- ── 숏폼 좋아요 ─────────────────────────────────────────
create table if not exists public.short_likes (
  short_id   uuid not null references public.shorts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (short_id, user_id)
);
alter table public.short_likes enable row level security;

drop policy if exists "숏폼좋아요 조회" on public.short_likes;
create policy "숏폼좋아요 조회" on public.short_likes for select to authenticated using (true);
drop policy if exists "숏폼좋아요 추가" on public.short_likes;
create policy "숏폼좋아요 추가" on public.short_likes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "숏폼좋아요 취소" on public.short_likes;
create policy "숏폼좋아요 취소" on public.short_likes for delete to authenticated using (user_id = auth.uid());

create or replace function public.bump_short_like_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.shorts set like_count = like_count + 1 where id = new.short_id;
  elsif tg_op = 'DELETE' then
    update public.shorts set like_count = greatest(like_count - 1, 0) where id = old.short_id;
  end if;
  return null;
end $$;

drop trigger if exists trg_short_like_count on public.short_likes;
create trigger trg_short_like_count
  after insert or delete on public.short_likes
  for each row execute function public.bump_short_like_count();
