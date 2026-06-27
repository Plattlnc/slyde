import SubPage, { ComingSoon } from "@/components/sub-page";

export default function CentersPage() {
  return (
    <SubPage emoji="🔧" title="내 주변 정비소">
      <ComingSoon
        desc="현재 위치 기준 가까운 정비소·서비스센터를 찾고 긴급출동을 요청합니다."
        planned={[
          "지도 + 현재 위치 기반 검색 (카카오맵)",
          "거리순 정비소 목록 (영업시간/연락처)",
          "긴급출동 요청 (가까운 센터 → 협력센터 순)",
          "정비소 상세 + 길찾기",
          "이용 후기 / 평점",
        ]}
      />
    </SubPage>
  );
}
