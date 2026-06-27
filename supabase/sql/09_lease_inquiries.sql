-- ============================================================
-- [09] 리스/렌탈 상담신청
-- ------------------------------------------------------------
-- 사용법: 전체 복사 → Supabase SQL Editor → Run.
-- ============================================================

create table if not exists public.lease_inquiries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  plan_id    text not null,
  plan_name  text,
  phone      text not null,
  message    text,
  created_at timestamptz not null default now()
);
alter table public.lease_inquiries enable row level security;

drop policy if exists "상담신청 작성" on public.lease_inquiries;
create policy "상담신청 작성" on public.lease_inquiries
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "내 상담신청 조회" on public.lease_inquiries;
create policy "내 상담신청 조회" on public.lease_inquiries
  for select to authenticated using (user_id = auth.uid());
