import SubPage from "@/components/sub-page";
import FoodList from "@/components/food-list";

export default function FoodPage() {
  return (
    <SubPage emoji="🍜" title="내 주변 맛집">
      <FoodList />
    </SubPage>
  );
}
