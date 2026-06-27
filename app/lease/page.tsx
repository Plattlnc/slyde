import SubPage from "@/components/sub-page";
import LeaseList from "@/components/lease-list";

export default function LeasePage() {
  return (
    <SubPage emoji="🚗" title="리스/렌탈">
      <LeaseList />
    </SubPage>
  );
}
