-- ============================================================
-- [17] 숏폼 댓글 답글 (parent_id)
-- ------------------------------------------------------------
-- 사용법: 전체 복사 → Supabase SQL Editor → Run. (15·16 이후)
-- (like_count는 16에서 이미 추가됨)
-- ============================================================

alter table public.short_comments
  add column if not exists parent_id uuid references public.short_comments(id) on delete cascade;
create index if not exists short_comments_parent_idx on public.short_comments (parent_id);
