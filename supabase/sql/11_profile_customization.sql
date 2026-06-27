-- ============================================================
-- [11] 프로필 꾸미기 (아바타/이름이모지/소개/뱃지)
-- ------------------------------------------------------------
-- 사용법: 전체 복사 → Supabase SQL Editor → Run.
-- ============================================================

alter table public.profiles add column if not exists avatar     text not null default '🛵';
alter table public.profiles add column if not exists avatar_url text;  -- 업로드한 프로필 사진(있으면 이모지보다 우선)
alter table public.profiles add column if not exists name_emoji text not null default '';
alter table public.profiles add column if not exists bio        text;
alter table public.profiles add column if not exists badges     text[] not null default '{}';

-- (참고) 본인 프로필 수정 정책은 01_auth_profiles.sql 의 "본인 프로필 수정" 으로 이미 허용됨
