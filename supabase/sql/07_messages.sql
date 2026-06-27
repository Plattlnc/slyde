-- ============================================================
-- [07] 1:1 메시지 (DM) + 실시간
-- ------------------------------------------------------------
-- 사용법: 전체 복사 → Supabase SQL Editor → Run.
-- ============================================================

-- 상대 이름 표시 / 유저 검색을 위해 프로필 조회를 로그인 사용자에게 허용
-- (name/tier/company 정도의 공개 표시 정보)
drop policy if exists "프로필 공개 조회" on public.profiles;
create policy "프로필 공개 조회"
  on public.profiles for select to authenticated using (true);

-- ── 메시지 ──────────────────────────────────────────────
create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  content      text not null check (char_length(content) between 1 and 2000),
  created_at   timestamptz not null default now()
);
create index if not exists messages_pair_idx on public.messages (sender_id, recipient_id, created_at);
create index if not exists messages_recipient_idx on public.messages (recipient_id, created_at);

alter table public.messages enable row level security;

drop policy if exists "내 대화 조회" on public.messages;
create policy "내 대화 조회" on public.messages
  for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "메시지 전송" on public.messages;
create policy "메시지 전송" on public.messages
  for insert to authenticated
  with check (sender_id = auth.uid());

-- 실시간 구독 활성화 (이미 추가돼 있으면 무시)
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;
