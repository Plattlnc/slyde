// 라이더 개인 SLA 데이터 + 집계 로직 (목업)
// ⚠️ 실제 연동 시: RIDER_DAILY를 스크래퍼→Supabase 일별 데이터로 교체.
//    하루 1 레코드, 아래 DailyRiderRecord 구조 유지하면 aggregate 로직 재사용 가능.
// (CLAUDE.md 4번 스펙 기준)

export type Metric = { food: number; bmart: number; store: number; total: number };

export type Peak = {
  morning_lunch: number; // 아침점심피크
  afternoon_offpeak: number; // 오후논피크
  evening: number; // 저녁피크
  midnight_offpeak: number; // 심야논피크
};

export type DailyRiderRecord = {
  rider_id: string;
  rider_name: string;
  date: string; // YYYY-MM-DD
  completed: Metric;
  rejected: Metric;
  dispatch_cancel: Metric;
  delivery_cancel: Metric; // 라이더 귀책
  peak: Peak;
};

export const SLA_PROFILE = {
  name: "김태성",
  uid: "o1075622667",
  phone: "010-8504-2666",
  status: "운행중",
};

export const PEAK_LABELS: Record<keyof Peak, string> = {
  morning_lunch: "아침점심피크",
  afternoon_offpeak: "오후논피크",
  evening: "저녁피크",
  midnight_offpeak: "심야논피크",
};

export type Period = "today" | "week" | "month";

export const PERIOD_META: Record<
  Period,
  { tab: string; gauge: string; total: string }
> = {
  today: { tab: "오늘", gauge: "오늘 수락률", total: "오늘 총 배달건수" },
  week: { tab: "주간", gauge: "주간 수락률", total: "주간 총 배달건수" },
  month: { tab: "월간", gauge: "월간 수락률", total: "월간 총 배달건수" },
};

// ── 시드 기반 난수 (목데이터 재현용, SSR/CSR 동일값 보장) ──
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// total을 weights 비율대로 정수 분배 (합이 total과 정확히 일치)
function splitWeighted(total: number, weights: number[]): number[] {
  const raw = weights.map((w) => total * w);
  const floors = raw.map(Math.floor);
  const used = floors.reduce((a, b) => a + b, 0);
  const remainder = total - used;
  const order = raw
    .map((r, i) => ({ i, frac: r - floors[i] }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < remainder; k++) floors[order[k % order.length].i]++;
  return floors;
}

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function makeDailyRecord(date: Date, rnd: () => number): DailyRiderRecord {
  const completedTotal = 16 + Math.floor(rnd() * 20); // 16~35
  const rejectedTotal = Math.floor(rnd() * 6); // 0~5
  const dispatchTotal = rnd() < 0.6 ? 0 : 1 + Math.floor(rnd() * 2);
  const deliveryTotal = rnd() < 0.85 ? 0 : 1;

  const pw = [0.9 + rnd() * 0.06, rnd() * 0.03, 0];
  pw[2] = Math.max(0, 1 - pw[0] - pw[1]);
  const split = (total: number): Metric => {
    const [food, bmart, store] = splitWeighted(total, pw);
    return { food, bmart, store, total };
  };

  const peakW = [
    0.38 + rnd() * 0.12,
    0.28 + rnd() * 0.1,
    0.12 + rnd() * 0.08,
    rnd() * 0.04,
  ];
  const wsum = peakW.reduce((a, b) => a + b, 0);
  const [p1, p2, p3, p4] = splitWeighted(
    completedTotal,
    peakW.map((w) => w / wsum),
  );

  return {
    rider_id: SLA_PROFILE.uid,
    rider_name: SLA_PROFILE.name,
    date: fmtDate(date),
    completed: split(completedTotal),
    rejected: split(rejectedTotal),
    dispatch_cancel: split(dispatchTotal),
    delivery_cancel: split(deliveryTotal),
    peak: {
      morning_lunch: p1,
      afternoon_offpeak: p2,
      evening: p3,
      midnight_offpeak: p4,
    },
  };
}

function buildRiderDaily(): DailyRiderRecord[] {
  const TODAY = new Date(2026, 5, 27); // 2026-06-27
  const days: DailyRiderRecord[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(TODAY);
    d.setDate(TODAY.getDate() - i);

    if (i === 0) {
      // 오늘 = 실제 캡처값 고정
      days.push({
        rider_id: SLA_PROFILE.uid,
        rider_name: SLA_PROFILE.name,
        date: fmtDate(d),
        completed: { food: 26, bmart: 0, store: 1, total: 27 },
        rejected: { food: 3, bmart: 0, store: 0, total: 3 },
        dispatch_cancel: { food: 1, bmart: 0, store: 0, total: 1 },
        delivery_cancel: { food: 0, bmart: 0, store: 0, total: 0 },
        peak: {
          morning_lunch: 14,
          afternoon_offpeak: 11,
          evening: 2,
          midnight_offpeak: 0,
        },
      });
    } else {
      days.push(makeDailyRecord(d, mulberry32(1000 + i)));
    }
  }
  return days; // 오래된 날 → 오늘 순
}

export const RIDER_DAILY = buildRiderDaily();

const emptyMetric = (): Metric => ({ food: 0, bmart: 0, store: 0, total: 0 });

export type Aggregated = {
  completed: Metric;
  rejected: Metric;
  dispatch_cancel: Metric;
  delivery_cancel: Metric;
  peak: Peak;
};

const METRIC_KEYS = [
  "completed",
  "rejected",
  "dispatch_cancel",
  "delivery_cancel",
] as const;

export function aggregate(records: DailyRiderRecord[]): Aggregated {
  const out: Aggregated = {
    completed: emptyMetric(),
    rejected: emptyMetric(),
    dispatch_cancel: emptyMetric(),
    delivery_cancel: emptyMetric(),
    peak: {
      morning_lunch: 0,
      afternoon_offpeak: 0,
      evening: 0,
      midnight_offpeak: 0,
    },
  };
  for (const r of records) {
    for (const k of METRIC_KEYS) {
      out[k].food += r[k].food;
      out[k].bmart += r[k].bmart;
      out[k].store += r[k].store;
      out[k].total += r[k].total;
    }
    (Object.keys(out.peak) as (keyof Peak)[]).forEach((p) => {
      out.peak[p] += r.peak[p];
    });
  }
  return out;
}

export function rangeForPeriod(period: Period): DailyRiderRecord[] {
  if (period === "today") return RIDER_DAILY.slice(-1);
  if (period === "week") return RIDER_DAILY.slice(-7);
  return RIDER_DAILY.slice(-30);
}

export function rangeLabel(period: Period, records: DailyRiderRecord[]): string {
  if (period === "today") return `${records[0].date} 기준`;
  return `${records[0].date} ~ ${records[records.length - 1].date}`;
}

// 수락률 = 완료 / (완료+거절+배차취소+배달취소)  (CLAUDE.md 공식)
export function acceptanceRate(a: Aggregated): { rate: number; denom: number } {
  const denom =
    a.completed.total +
    a.rejected.total +
    a.dispatch_cancel.total +
    a.delivery_cancel.total;
  const rate = denom ? Math.round((a.completed.total / denom) * 1000) / 10 : 0;
  return { rate, denom };
}

export function gaugeColor(v: number): { c: string; bg: string; text: string } {
  if (v >= 85) return { c: "#1E9E5A", bg: "rgba(30,158,90,0.12)", text: "양호" };
  if (v >= 70) return { c: "#E8590C", bg: "rgba(232,89,12,0.12)", text: "주의" };
  return { c: "#D9342B", bg: "rgba(217,52,43,0.12)", text: "위험" };
}
