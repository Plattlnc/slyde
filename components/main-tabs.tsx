import TabCarousel from "@/components/tab-carousel";
import HomeContent from "@/components/home-content";
import ShortsContent from "@/components/shorts-content";
import MessagesContent from "@/components/messages-content";
import ProfileContent from "@/components/profile-content";

// 4개 메인 탭을 하나의 캐러셀로 (서버에서 각 탭 데이터 렌더 → 클라 캐러셀이 패널로 감쌈)
export default function MainTabs({ initial }: { initial: number }) {
  return (
    <TabCarousel initial={initial}>
      <HomeContent />
      <ShortsContent />
      <MessagesContent />
      <ProfileContent />
    </TabCarousel>
  );
}
