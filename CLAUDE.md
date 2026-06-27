# CLAUDE.md — slyde

> 이 파일은 Claude(및 모든 작업자)가 매 작업 전에 읽는 프로젝트 헌법입니다.
> 코드보다 먼저 읽고, 여기 적힌 비전·구조·규칙·금지사항에 맞춰 작업합니다.
> (두 갈래 비전 — SNS 슈퍼앱 + SLA 대시보드 — 을 통합한 문서입니다.)

---

## 1. 한 줄 정의

**slyde = 배달 라이더를 위한 슈퍼앱.**
개인 운행 데이터(SLA) 대시보드 + 차량/사고 관련 실생활 서비스 + 라이더 전용 SNS·커뮤니티를 하나로 묶는다.

타겟 사용자: 한국의 배달 라이더(개인 + 협력사 소속).

**핵심 데이터 동력**: 관리자 페이지에서 스크래핑한 실적 데이터를 Supabase에 적재해,
각 라이더가 본인의 SLA(완료/거절/취소/수락률 등)를 대시보드로 본다. (아래 4번 참고)

---

## 2. 제품 영역 (3개 축)

### A. 대시보드 & 라이더 서비스
- **개인 SLA 대시보드** ← 이 프로젝트의 데이터 핵심. 상세 스펙은 4번 섹션.
- **사고 접수** — 사고 발생 시 접수 플로우(사진/위치/시간 기록).
- **광고 배너 / 제휴** — 차량/리스/보험 등 (예: 올카, 라이트바겐, 리스사). 피드 내 스폰서 글로도 노출.
- **가까운 서비스센터 찾기** — 지도 기반 위치 검색.
- **긴급출동 요청** — 가장 가까운 서비스센터 → (협력센터 순) 연락/요청.
- **입점사 미니서비스** — 제휴사 입점 소형 서비스 + 각 협력사 광고(자사 프로모션, 기사 모집 등).

### B. SNS (라이더 전용 소셜) — 현재 홈 화면
- **홈 = Threads 스타일 피드** (현재 구현됨): 상단 로고바 → 인스타 스타일 스토리 줄 → 작성창 → 스레드 카드 피드(좋아요/답글/리포스트/공유, 중간 스폰서 글).
- **스토리** — 인스타그램 스타일 상단 동그라미.
- **커뮤니티** — 디시인사이드 스타일 게시판.
- **프로필 꾸미기** — 디스코드 스타일.
- **인증 회원가입** — 블라인드 스타일(소속/자격 인증).
- **1:1 메신저**, **팔로잉/팔로워**.

### C. 커뮤니티 게시판
- 일상 / 유머 · 질문 / 답변 · 사건 / 사고

---

## 3. 회원 모델

| 회원 등급 | 정체성 | 비고 |
|---|---|---|
| 기업회원 | 협력사(업체) | 소속 라이더 관리, 광고/입점 주체 |
| 협력사회원 | 협력사 소속 라이더 | 협력사에 귀속 |
| 개인회원 | 일반 라이더 | 협력사 미소속 |

**핵심 규칙: 협력사 미소속 라이더도 자유롭게 가입 가능해야 한다.**

---

## 4. SLA 대시보드 상세 스펙 (팀원 정의 — 데이터 핵심)

> 출처: 팀원(프로젝트 리드) 정의. UI 프로토타입: `rider_sla_dashboard_prototype.html`.
> 실제 구현 시 프로토타입의 `RIDER_DAILY` 배열 + `aggregate()` 로직을 Supabase 쿼리로 교체.
> 색상/게이지/카드 레이아웃은 프로토타입 기준 유지.

### 아키텍처
```
[VPS: 스크래퍼 상시 프로세스]  — 관리자 세션 로그인 유지, 1분마다 조회 → Supabase upsert
        ↓
[Supabase] — 라이더별 "일별 레코드" 단위 정규화 저장 (raw 아님)
        ↓
[Vercel: Next.js 프론트] — 라이더 로그인 → 본인 데이터만 조회(RLS) → 오늘/주간/월간 탭 합산 표시
```

### 데이터 모델 (확정 전까지 이 구조 유지)
하루 1 라이더당 1 레코드. 모든 지표는 푸드/비마트/배민스토어 합계가 total과 일치해야 함.
```ts
type DailyRiderRecord = {
  rider_id: string;       // 관리자 페이지 아이디 (예: o1075622667)
  rider_name: string;
  date: string;           // YYYY-MM-DD
  completed:       { food: number; bmart: number; store: number; total: number };
  rejected:        { food: number; bmart: number; store: number; total: number };
  dispatch_cancel: { food: number; bmart: number; store: number; total: number };
  delivery_cancel: { food: number; bmart: number; store: number; total: number }; // 라이더 귀책
  peak: {
    morning_lunch: number;     // 아침점심피크
    afternoon_offpeak: number; // 오후논피크
    evening: number;           // 저녁피크
    midnight_offpeak: number;  // 심야논피크
  };
};
```

### 수락률 공식 (관리자 화면 88.9% 값으로 역산·검증, 변경 시 여기 갱신)
```
수락률 = completed.total / (completed.total + rejected.total + dispatch_cancel.total + delivery_cancel.total)
```

---

## 5. 기술 스택

- **프론트엔드**: Next.js (App Router) + TypeScript + Tailwind CSS v4 — **이미 스캐폴딩 완료**(이 레포의 app/).
  - 외부 폰트 의존 제거(시스템 폰트), 아이콘은 이모지/인라인 SVG. (로컬 네트워크 블로커 대응)
- **DB / Auth / 실시간 / 스토리지**: Supabase (라이더는 본인 row만 — RLS 필수)
- **배포**: Vercel
- **스크래퍼**: 클라우드 VPS 상시 구동, 1분 갱신, Node/TypeScript
- **지도**: 카카오맵 (서비스센터/긴급출동)
- **인증**: 카카오 로그인 + 자격/소속 인증

> 팀원 주의: "스택은 이미 연동 완료 — 새로 셋업하지 말 것." Supabase/Vercel 프로젝트가 외부에 이미 있을 수 있으니,
> 인프라 새로 만들기 전 반드시 사용자에게 확인.

---

## 6. 폴더 구조 (통합)

```
slyde/
├─ app/                 # Next.js (현재: 홈=SNS 피드)
│  ├─ page.tsx          # 홈 (Threads 피드 + 스토리)
│  ├─ dashboard/        # 라이더 개인 SLA 대시보드 (오늘/주간/월간) ← 4번 스펙
│  └─ api/              # 프론트용 집계 API (오늘/주간/월간 합산 쿼리)
├─ components/          # UI 컴포넌트 (feed/stories/nav/dashboard ...)
├─ lib/                 # mock-data, supabase 클라이언트, 유틸
├─ supabase/            # 스키마/마이그레이션, RLS 정책
├─ scraper/             # 관리자 페이지 수집 + Supabase upsert (VPS 구동)
├─ rider_sla_dashboard_prototype.html  # SLA 대시보드 UI 프로토타입(참고)
└─ CLAUDE.md
```

### 병렬 작업 분담 (서로 독립, 별도 브랜치/워크트리)
1. **scraper/** — 로그인 세션 유지 + 1분 수집 + upsert (엔드포인트 미확정 → 코드 전 확인)
2. **supabase/** — 스키마/마이그레이션, RLS
3. **app/api/** — 집계 API
4. **app/dashboard/** — 대시보드 페이지 UI

---

## 7. 절대 하지 말 것

- **커밋/푸시는 사용자가 명시적으로 요청할 때만.** (현재: 로컬 작업만. GitHub Desktop "Discard all changes" 주의 — 과거 1회 사고)
- 스크래핑 대상의 로그인 폼/엔드포인트/셀렉터를 **추측해서 하드코딩 금지** — 확인 후 진행.
- 다른 라이더 데이터가 보이는 쿼리 금지 (**RLS 필수**).
- 폴링 주기를 1분보다 짧게 임의 변경 금지 (부하 고려 합의값).
- 인프라(Supabase/Vercel)를 **새로 셋업하기 전 사용자 확인**.
- 배달 플랫폼 스크래핑은 약관/법적 이슈 가능 → 사용자 본인 데이터 한정 원칙.

---

## 8. 현재 상태 (2026-06-28)

- 프론트 스캐폴딩 완료, **홈 = SNS 피드(Threads 스타일) + 스토리 줄 + 아이콘 하단바** 구현·실행 확인(localhost:3000).
- 데이터는 전부 `lib/mock-data.ts` 목업 → 추후 Supabase/스크래퍼 연동으로 교체.
- 미구현: SLA 대시보드 페이지, scraper/, supabase/, app/api/, 커뮤니티/스토리/메신저 실페이지.
- 협업: origin/main에 팀원(Plattlnc) 커밋(SLA 스펙·프로토타입·check-setup.sh) 존재. 로컬과 분기됨 — 합칠 때 정리 필요.
- 작업 규칙: 한국어 소통.
