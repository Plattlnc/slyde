import MainTabs from "@/components/main-tabs";

// 새로고침/직접접속은 홈에서 시작 (탭 이동은 캐러셀이 처리)
export default function ShortsPage() {
  return <MainTabs initial={0} />;
}
