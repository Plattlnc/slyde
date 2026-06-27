import SubPage from "@/components/sub-page";
import GasList from "@/components/gas-list";

export default function GasPage() {
  return (
    <SubPage emoji="⛽" title="내 주변 주유소">
      <GasList />
    </SubPage>
  );
}
