-- ============================================================
-- [10] 사고접수
-- ------------------------------------------------------------
-- 사용법: 전체 복사 → Supabase SQL Editor → Run.
-- ============================================================

create table if not exists public.accident_reports (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade default auth.uid(),
  type        text,            -- 차량 단독 / 상대 차량 / 보행자 / 기타
  occurred_at timestamptz,
  place       text,
  detail      text,
  injury      text,            -- 없음 / 경상 / 중상
  image_urls  text[] not null default '{}',
  created_at  timestamptz not null default now()
);
alter table public.accident_reports enable row level security;

drop policy if exists "사고 접수 작성" on public.accident_reports;
create policy "사고 접수 작성" on public.accident_reports
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "내 사고 접수 조회" on public.accident_reports;
create policy "내 사고 접수 조회" on public.accident_reports
  for select to authenticated using (user_id = auth.uid());
