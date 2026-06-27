import SubPage, { ComingSoon } from "@/components/sub-page";

export default function LeasePage() {
  return (
    <SubPage emoji="🚗" title="리스/렌탈">
      <ComingSoon
        desc="라이더 전용 이륜차·차량 리스/렌탈 상품을 비교하고 상담을 신청합니다."
        planned={[
          "제휴사별 리스/렌탈 상품 목록 (올카·라이트바겐 등)",
          "월 납입금 / 보증금 / 약정 비교",
          "전기 이륜차 보조금 안내",
          "상담 신청 폼",
          "내 신청 내역",
        ]}
      />
    </SubPage>
  );
}
