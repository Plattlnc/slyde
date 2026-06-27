export type Center = {
  id: string;
  name: string;
  type: "서비스센터" | "정비소" | "협력센터";
  phone: string;
  lat: number;
  lng: number;
  distanceM: number;
};

// 데모용 정비소 템플릿 (내 위치 기준 상대 오프셋으로 배치 → 어디서나 "주변"에 표시)
const TEMPLATES: {
  name: string;
  type: Center["type"];
  phone: string;
  dLat: number;
  dLng: number;
}[] = [
  { name: "번개 모터스 서비스센터", type: "서비스센터", phone: "0212345678", dLat: 0.0026, dLng: 0.0012 },
  { name: "퀵바이크 정비소", type: "정비소", phone: "0223456789", dLat: -0.0018, dLng: 0.0031 },
  { name: "라이더 긴급출동 협력센터", type: "협력센터", phone: "0234567890", dLat: 0.0009, dLng: -0.0027 },
  { name: "스피드 이륜차 정비", type: "정비소", phone: "0245678901", dLat: -0.0035, dLng: -0.0014 },
  { name: "올바이크 종합 서비스센터", type: "서비스센터", phone: "0256789012", dLat: 0.0042, dLng: 0.0038 },
];

// 하버사인 거리 (m)
export function haversine(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(s)));
}

export function nearbyCenters(lat: number, lng: number): Center[] {
  return TEMPLATES.map((t, i) => {
    const cLat = lat + t.dLat;
    const cLng = lng + t.dLng;
    return {
      id: "c" + i,
      name: t.name,
      type: t.type,
      phone: t.phone,
      lat: cLat,
      lng: cLng,
      distanceM: haversine(lat, lng, cLat, cLng),
    };
  }).sort((a, b) => a.distanceM - b.distanceM);
}

export function fmtDistance(m: number): string {
  return m < 1000 ? `${m}m` : `${(m / 1000).toFixed(1)}km`;
}

export function fmtPhone(p: string): string {
  // 02-xxxx-xxxx 형태로 대충 포맷
  if (p.startsWith("02"))
    return p.replace(/(\d{2})(\d{3,4})(\d{4})/, "$1-$2-$3");
  return p.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3");
}

// 서울시청 (위치 거부 시 폴백)
export const DEFAULT_POS = { lat: 37.5665, lng: 126.978 };
