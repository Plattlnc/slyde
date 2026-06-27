-- ============================================================
-- [06] 게시글 사진 첨부 (image_urls)
-- ------------------------------------------------------------
-- 사용법: 전체 복사 → Supabase SQL Editor → Run. (05_shorts.sql 이후 — shorts 버킷 재사용)
-- ============================================================

-- 이미지 URL 배열 (Storage 'shorts' 버킷에 업로드된 공개 URL들)
alter table public.posts add column if not exists image_urls text[] not null default '{}';

-- 사진만 올리는 글도 허용 → content 빈값/널 허용 (길이 제한만 유지)
alter table public.posts alter column content drop not null;
alter table public.posts drop constraint if exists posts_content_check;
alter table public.posts
  add constraint posts_content_len
  check (char_length(coalesce(content, '')) <= 1000);
