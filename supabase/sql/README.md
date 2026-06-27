# Supabase SQL — 복붙용 모음

여기 있는 `.sql` 파일들을 **Supabase 대시보드에서 직접 실행**하는 곳입니다.
(로컬 anon 키로는 테이블 생성이 안 되므로, 이 SQL들은 대시보드에서 복붙해 돌립니다.)

## 실행 방법

1. https://supabase.com/dashboard → 프로젝트 선택
2. 왼쪽 메뉴 **SQL Editor** → **New query**
3. 아래 파일을 **번호순으로** 열어서, 파일 내용 전체를 복사 → 붙여넣기 → **Run** (▶)
4. 초록색 "Success" 뜨면 완료

> 모든 파일은 여러 번 실행해도 안전(idempotent)하게 작성돼 있어요.

## 파일 목록 (순서대로)

| # | 파일 | 내용 |
|---|------|------|
| 01 | `01_auth_profiles.sql` | 회원 등급(개인/협력사/기업) + `profiles` 테이블 + RLS + 가입 시 자동 프로필 |
| 02 | `02_posts.sql` | SNS 피드 글 `posts` 테이블 + RLS + 작성자 자동 채움 |
| 03 | `03_engagement.sql` | 좋아요·댓글 테이블 + RLS + 카운트 자동 집계 트리거 |
| 04 | `04_share.sql` | 공유 횟수 `share_count` 컬럼 + 증가 함수 |
| 05 | `05_shorts.sql` | 숏폼(사진/영상) 테이블 + Storage 버킷 + 좋아요 |
| 06 | `06_post_images.sql` | 게시글 사진 첨부 `image_urls` + 사진만 올리기 허용 |
| 07 | `07_messages.sql` | 1:1 메시지(DM) 테이블 + RLS + 실시간 + 프로필 공개조회 |
| 08 | `08_follows.sql` | 팔로우/팔로워 테이블 + RLS + 카운트 집계 |
| 09 | `09_lease_inquiries.sql` | 리스/렌탈 상담신청 테이블 + RLS |
| 10 | `10_accident_reports.sql` | 사고접수 테이블 + RLS |

## 새 SQL이 필요할 때

- 다음 번호(`02_...`, `03_...`)로 파일을 추가합니다.
- 예: `02_posts.sql`(SNS 글), `03_rider_daily.sql`(SLA 데이터) 등.

## 확인용 쿼리

```sql
-- 가입된 프로필 보기
select id, name, tier, company, created_at from public.profiles order by created_at desc;
```
