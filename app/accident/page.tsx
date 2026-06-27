import SubPage, { ComingSoon } from "@/components/sub-page";

export default function AccidentPage() {
  return (
    <SubPage emoji="🚨" title="사고접수">
      <ComingSoon
        desc="사고 발생 시 사진·위치·시간을 기록해 빠르게 접수하고, 보험/협력센터로 연결합니다."
        planned={[
          "사진 첨부 (사고 현장/차량 손상)",
          "현재 위치 자동 기록 (지도)",
          "사고 유형·경위 입력 폼",
          "접수 내역 조회 및 진행 상태",
          "보험사 / 협력센터 연결",
        ]}
      />
    </SubPage>
  );
}
