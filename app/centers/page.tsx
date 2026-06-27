import PlacesMap from "@/components/places-map";

export default function CentersPage() {
  return (
    <PlacesMap
      keyword="오토바이"
      title="🔧 내 주변 정비소"
      itemEmoji="🔧"
      showSos
    />
  );
}
