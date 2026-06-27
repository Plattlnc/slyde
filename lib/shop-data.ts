export type ShopCategory = "안전장비" | "방한/방수" | "가방" | "거치/액세서리";

export type Product = {
  id: string;
  name: string;
  category: ShopCategory;
  price: number;
  emoji: string;
  desc: string;
  badge?: string; // 예: "베스트", "신상"
};

export const SHOP_CATEGORIES: ShopCategory[] = [
  "안전장비",
  "방한/방수",
  "가방",
  "거치/액세서리",
];

export const products: Product[] = [
  {
    id: "p1",
    name: "풀페이스 안전 헬멧",
    category: "안전장비",
    price: 89000,
    emoji: "🪖",
    desc: "KC 인증 풀페이스 헬멧. 충격 흡수 EPS 라이너와 김서림 방지 실드 적용. 장시간 운행에도 가벼운 무게.",
    badge: "베스트",
  },
  {
    id: "p2",
    name: "방수 라이딩 장갑",
    category: "안전장비",
    price: 24000,
    emoji: "🧤",
    desc: "터치스크린 대응 방수 장갑. 손등 프로텍터로 안전성 강화, 통기성 좋은 소재.",
  },
  {
    id: "p3",
    name: "전천후 방수 우의 세트",
    category: "방한/방수",
    price: 39000,
    emoji: "🧥",
    desc: "상하의 분리형 방수 우의. 야간 시인성 반사 띠 부착, 통기 밴드로 땀참 최소화.",
    badge: "신상",
  },
  {
    id: "p4",
    name: "겨울용 방한 토시 + 워머",
    category: "방한/방수",
    price: 19000,
    emoji: "🧣",
    desc: "기모 안감 방한 토시와 넥워머 세트. 칼바람 차단으로 겨울 야간 운행 필수템.",
  },
  {
    id: "p5",
    name: "대용량 배달 가방 (보온/보냉)",
    category: "가방",
    price: 55000,
    emoji: "🎒",
    desc: "보온·보냉 2중 단열 배달 가방. 칸막이 조절 가능, 방수 원단, 어깨끈 쿠션 강화.",
    badge: "베스트",
  },
  {
    id: "p6",
    name: "보조 크로스백",
    category: "가방",
    price: 21000,
    emoji: "👜",
    desc: "휴대폰·보조배터리·영수증 수납용 컴팩트 크로스백. 방수 지퍼.",
  },
  {
    id: "p7",
    name: "오토바이 스마트폰 거치대",
    category: "거치/액세서리",
    price: 27000,
    emoji: "📱",
    desc: "진동 흡수 구조의 핸들바 거치대. 원터치 장착, 대부분 기종 호환.",
    badge: "베스트",
  },
  {
    id: "p8",
    name: "USB 고속 충전 모듈",
    category: "거치/액세서리",
    price: 18000,
    emoji: "🔌",
    desc: "운행 중 휴대폰 충전을 위한 방수 USB 충전 모듈. 과전류 보호 회로 내장.",
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function formatWon(n: number): string {
  return n.toLocaleString("ko-KR") + "원";
}
