// 카카오 로컬 키워드 검색 결과 (documents 항목)
export type KakaoPlace = {
  id: string;
  place_name: string;
  road_address_name: string;
  address_name: string;
  phone: string;
  place_url: string;
  x: string; // 경도(lng)
  y: string; // 위도(lat)
  distance: string; // 미터 (문자열)
  category_name: string;
};

export function fmtDistance(mStr: string): string {
  const m = parseInt(mStr || "0", 10);
  if (!m) return "";
  return m < 1000 ? `${m}m` : `${(m / 1000).toFixed(1)}km`;
}

// 위치 거부 시 폴백 (서울시청)
export const DEFAULT_POS = { lat: 37.5665, lng: 126.978 };
