import SubPage from "@/components/sub-page";
import CarList from "@/components/car-list";

export default function CarsPage() {
  return (
    <SubPage emoji="🚙" title="신차/중고차">
      <CarList />
    </SubPage>
  );
}
