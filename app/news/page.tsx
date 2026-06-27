import SubPage, { ComingSoon } from "@/components/sub-page";

export default function NewsPage() {
  return (
    <SubPage emoji="📰" title="배달뉴스">
      <ComingSoon
        desc="배달 업계 소식·정책 변경·플랫폼 공지를 한곳에서 봅니다."
        planned={[
          "카테고리별 뉴스 피드 (정책/플랫폼/안전)",
          "주요 공지 상단 고정",
          "기사 상세 + 원문 링크",
          "관심 키워드 알림",
          "스크랩(나중에 보기)",
        ]}
      />
    </SubPage>
  );
}
