# 프로젝트: 라이더 개인 SLA 대시보드

## 한 줄 요약
관리자 계정으로 로그인 가능한 배달 라이더 관리 시스템(SLA/라이더현황 페이지)에서
실시간 데이터를 스크래핑해 Supabase에 적재하고, 각 라이더 개인이 자신의 일/주/월간
실적(완료·거절·배차취소·배달취소, 플랫폼별, 피크시간대별, 수락률)을 확인할 수 있는
별도 대시보드를 만든다.

## 스택 / 인프라 (이미 연동 완료, 새로 셋업하지 말 것)
- Git 레포: [레포 URL 적기]
- 배포: Vercel (프론트엔드)
- DB/Auth: Supabase
- 스크래퍼 실행 환경: 클라우드 VPS (24시간 상시 구동, PC 의존 없음)
- 갱신 주기: 1분
- 개발 언어: Node.js / TypeScript 권장

## 아키텍처 개요
```
[VPS: 스크래퍼 상시 프로세스]
   - 관리자 계정 세션 로그인 유지 (쿠키/토큰, 만료 시 자동 재로그인)
   - 1분마다 관리자 페이지(또는 내부 API) 조회
   - 결과를 Supabase 테이블에 upsert
        ↓
[Supabase: 데이터 저장소]
   - 라이더별 "일별 레코드" 단위로 저장 (raw가 아니라 정규화된 합계값)
        ↓
[Vercel: Next.js 프론트엔드]
   - 라이더 로그인 → 본인 데이터만 조회 (RLS 적용)
   - 오늘 / 주간 / 월간 탭 → 선택 기간 합산해서 표시
```

## 데이터 모델 (참고 프로토타입 기준, 확정 전까지 이 구조 유지)
하루 1 라이더당 1 레코드. 모든 지표는 푸드/비마트/배민스토어 합계가 total과 일치해야 함.

```ts
type DailyRiderRecord = {
  rider_id: string;       // 관리자 페이지의 아이디 (예: o1075622667)
  rider_name: string;
  date: string;            // YYYY-MM-DD
  completed: { food: number; bmart: number; store: number; total: number };
  rejected: { food: number; bmart: number; store: number; total: number };
  dispatch_cancel: { food: number; bmart: number; store: number; total: number };
  delivery_cancel: { food: number; bmart: number; store: number; total: number }; // 라이더 귀책
  peak: {
    morning_lunch: number;   // 아침점심피크
    afternoon_offpeak: number; // 오후논피크
    evening: number;          // 저녁피크
    midnight_offpeak: number; // 심야논피크
  };
};
```

수락률 계산 공식 (관리자 화면 88.9% 값으로 역산해 검증한 공식, 변경 시 여기 갱신):
```
수락률 = completed.total / (completed.total + rejected.total + dispatch_cancel.total + delivery_cancel.total)
```

## UI 참고
`/docs/rider_sla_dashboard_prototype.html` — 디자인/데이터 합산 로직 프로토타입.
실제 구현 시 이 파일의 `RIDER_DAILY` 배열 + `aggregate()` 로직을 Supabase 쿼리로 교체하면 됨.
색상/게이지/카드 레이아웃은 이 프로토타입을 기준으로 유지.

## 작업 분리 (병렬 에이전트용)
아래 4개는 서로 독립적으로 진행 가능. 각 작업은 별도 브랜치/워크트리에서 작업할 것.

1. **scraper/** — 관리자 페이지 로그인 세션 유지 + 1분 주기 수집 + Supabase upsert
   - 로그인 폼/엔드포인트 구조는 아직 미확정 → 코드 작성 전 사용자에게 확인
2. **supabase/** — 스키마/마이그레이션, RLS 정책 (라이더는 본인 row만 조회 가능)
3. **app/api/** — 프론트엔드용 집계 API (오늘/주간/월간 합산 쿼리)
4. **app/dashboard/** — 라이더 개인 대시보드 페이지 (오늘/주간/월간 탭 UI)

## 절대 하지 말 것
- 스크래핑 대상의 로그인 폼 구조, API 엔드포인트, 셀렉터를 추측해서 하드코딩하지 말 것 — 확인 후 진행
- 다른 라이더의 데이터가 보이는 쿼리를 작성하지 말 것 (RLS 필수)
- 1분보다 짧은 폴링 주기로 임의 변경하지 말 것 (부하 고려해 합의된 값)

## 명령어 (확인 후 채워넣기)
- 설치: `[npm i / pnpm i]`
- 개발 서버: `[]`
- 빌드: `[]`
- 린트/타입체크: `[]`
- Supabase 마이그레이션 적용: `[]`
