import SubPage, { ComingSoon } from "@/components/sub-page";

export default function ShopPage() {
  return (
    <SubPage emoji="🛍️" title="라이더 용품샵">
      <ComingSoon
        desc="헬멧·방한용품·가방 등 라이더 필수 용품을 구매합니다."
        planned={[
          "카테고리별 상품 (안전장비/방한/가방/스마트폰 거치대)",
          "베스트셀러 / 신상품",
          "상품 상세 + 장바구니",
          "주문/배송 조회",
          "회원 등급별 할인",
        ]}
      />
    </SubPage>
  );
}
