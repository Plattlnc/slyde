export type LeasePlan = {
  id: string;
  sponsor: string;
  model: string;
  type: "리스" | "렌탈";
  fuel: "전기" | "가솔린";
  monthly: number; // 월 납입금
  deposit: number; // 보증금
  termMonths: number; // 약정 개월
  emoji: string;
  features: string[];
  gradient: string;
};

export const leasePlans: LeasePlan[] = [
  {
    id: "l1",
    sponsor: "올카",
    model: "전기 스쿠터 EV-S",
    type: "리스",
    fuel: "전기",
    monthly: 119000,
    deposit: 0,
    termMonths: 36,
    emoji: "🛵",
    features: ["첫 달 0원 프로모션", "보조금 적용가", "정기 점검 포함", "보험 연계 할인"],
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "l2",
    sponsor: "라이트바겐",
    model: "라이트 e-바이크 Pro",
    type: "렌탈",
    fuel: "전기",
    monthly: 99000,
    deposit: 100000,
    termMonths: 12,
    emoji: "⚡",
    features: ["배터리 교환형", "단기 약정 가능", "고장 시 즉시 대차", "주행거리 무제한"],
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "l3",
    sponsor: "리스사",
    model: "가솔린 110cc 배달형",
    type: "리스",
    fuel: "가솔린",
    monthly: 89000,
    deposit: 300000,
    termMonths: 48,
    emoji: "🏍️",
    features: ["검증된 내구성", "전국 정비망", "약정 만료 시 인수 가능", "배달 특화 적재함"],
    gradient: "from-orange-500 to-rose-600",
  },
];

export function getPlan(id: string): LeasePlan | undefined {
  return leasePlans.find((p) => p.id === id);
}

export function won(n: number): string {
  return n.toLocaleString("ko-KR") + "원";
}
