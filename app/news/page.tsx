import SubPage from "@/components/sub-page";
import NewsList from "@/components/news-list";

export default function NewsPage() {
  return (
    <SubPage emoji="📰" title="배달뉴스">
      <NewsList />
    </SubPage>
  );
}
