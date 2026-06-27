-- ============================================================
-- [01] 인증 / 프로필  (회원 등급 + RLS + 가입 시 자동 프로필)
-- ------------------------------------------------------------
-- 사용법: 이 파일 "전체"를 복사 → Supabase 대시보드 → SQL Editor
--        → New query 에 붙여넣기 → Run.  여러 번 실행해도 안전(idempotent).
-- ============================================================

-- 1) 회원 등급 enum (개인 / 협력사 / 기업)
do $$ begin
  create type member_tier as enum ('개인회원', '협력사회원', '기업회원');
exception when duplicate_object then null; end $$;

-- 2) 프로필 테이블 (auth.users 와 1:1)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  tier       member_tier not null default '개인회원',
  company    text,                 -- 협력사/기업회원만 사용
  created_at timestamptz not null default now()
);

-- 3) RLS: 본인 row 만 접근 (다른 라이더 데이터 차단 — 필수)
alter table public.profiles enable row level security;

drop policy if exists "본인 프로필 조회" on public.profiles;
create policy "본인 프로필 조회"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "본인 프로필 수정" on public.profiles;
create policy "본인 프로필 수정"
  on public.profiles for update using (auth.uid() = id);

-- 4) 신규 가입 시 프로필 자동 생성 (가입 폼 메타데이터 → profiles)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, tier, company)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    coalesce((new.raw_user_meta_data ->> 'tier')::member_tier, '개인회원'),
    nullif(new.raw_user_meta_data ->> 'company', '')
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ✅ 완료. 확인:  select * from public.profiles;
