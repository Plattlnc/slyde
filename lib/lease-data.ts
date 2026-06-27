export type LeasePlan = {
  id: string;
  name: string;
  sub: string;
  emoji: string;
  price: number; // 원
  unit: "월" | "일";
  best?: boolean;
  tags: string[];
  desc: string;
};

export const leasePlans: LeasePlan[] = [
  {
    id: "l1",
    name: "라이더렌탈",
    sub: "당일 출고 · 전국 32개 직영점",
    emoji: "🏍️",
    price: 198000,
    unit: "월",
    best: true,
    tags: ["무상정비 월1회", "사고 대차지원", "PCX·비전"],
    desc: "전국 32개 직영점에서 당일 출고 가능. 무상정비와 사고 대차지원으로 운행 공백을 최소화하는 라이더 전용 렌탈 1위 업체입니다.",
  },
  {
    id: "l2",
    name: "배달오토",
    sub: "전동 이륜차 특화 · 보증금 0원",
    emoji: "⚡",
    price: 149000,
    unit: "월",
    tags: ["보증금 0원", "배터리 무제한", "전동"],
    desc: "전동 이륜차 특화 업체. 보증금 0원에 배터리 교환·충전 무제한으로 유류비 부담 없이 운행할 수 있습니다.",
  },
  {
    id: "l3",
    name: "모토플렉스",
    sub: "정비 무제한 · 프리미엄",
    emoji: "🔧",
    price: 210000,
    unit: "월",
    tags: ["정비 무제한", "대차 100%", "비전·NMAX"],
    desc: "프리미엄 라인업. 정비 무제한과 100% 대차 지원으로 고가 차종도 안심하고 운행할 수 있습니다.",
  },
  {
    id: "l4",
    name: "스쿠터뱅크",
    sub: "단기 렌탈 전문 · 일 단위",
    emoji: "📅",
    price: 18000,
    unit: "일",
    tags: ["1일부터", "보증금0", "즉시 출고"],
    desc: "1일부터 빌릴 수 있는 단기 렌탈 전문. 보증금 없이 즉시 출고되어 급할 때 바로 이용할 수 있습니다.",
  },
  {
    id: "l5",
    name: "이륜거래소",
    sub: "장기 리스 · 구매 전환 가능",
    emoji: "💠",
    price: 178000,
    unit: "월",
    tags: ["구매 전환", "최장 36개월", "PCX·NMAX"],
    desc: "최장 36개월 장기 리스. 약정 만료 시 구매 전환이 가능해 내 차로 만들 수 있습니다.",
  },
];

// 칩 필터 키워드 → 매칭
export const LEASE_CHIPS = ["전체", "PCX", "비전", "전동", "보증금0"];
export function matchChip(plan: LeasePlan, chip: string): boolean {
  if (chip === "전체") return true;
  const hay = (plan.tags.join(" ") + " " + plan.sub).replace(/\s/g, "");
  if (chip === "보증금0") return hay.includes("보증금0");
  return hay.includes(chip);
}

export function getPlan(id: string): LeasePlan | undefined {
  return leasePlans.find((p) => p.id === id);
}

export function won(n: number): string {
  return n.toLocaleString("ko-KR") + "원";
}
