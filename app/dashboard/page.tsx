"use client";

import { useState } from "react";
import Link from "next/link";
import SlaGauge from "@/components/sla-gauge";
import {
  aggregate,
  acceptanceRate,
  gaugeColor,
  rangeForPeriod,
  rangeLabel,
  PERIOD_META,
  PEAK_LABELS,
  SLA_PROFILE,
  type Period,
  type Metric,
  type Peak,
} from "@/lib/sla-data";

function Chips({ m }: { m: Metric }) {
  const items: [string, number][] = [
    ["푸드", m.food],
    ["비마트", m.bmart],
    ["배민스토어", m.store],
  ];
  return (
    <div className="mt-2 flex flex-wrap gap-1.5 border-t border-[#E4E0D6] pt-2">
      {items.map(([label, v]) => (
        <span
          key={label}
          className="rounded-md bg-[#F6F4EF] px-1.5 py-0.5 text-[11px] text-[#5B6660] tabular-nums"
        >
          {label} <b className="font-bold text-[#1C2420]">{v}</b>
        </span>
      ))}
    </div>
  );
}

function StatCard({
  label,
  dot,
  m,
}: {
  label: string;
  dot: string;
  m: Metric;
}) {
  return (
    <div className="rounded-2xl border border-[#E4E0D6] bg-white p-3.5">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#5B6660]">
        <span
          className="h-[7px] w-[7px] rounded-full"
          style={{ background: dot }}
        />
        {label}
      </div>
      <div className="text-2xl font-extrabold tabular-nums text-[#1C2420]">
        {m.total}
        <span className="ml-0.5 text-[13px] font-semibold text-[#5B6660]">
          건
        </span>
      </div>
      <Chips m={m} />
    </div>
  );
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("today");
  const records = rangeForPeriod(period);
  const agg = aggregate(records);
  const { rate, denom } = acceptanceRate(agg);
  const gi = gaugeColor(rate);
  const meta = PERIOD_META[period];

  const peakEntries = (Object.keys(PEAK_LABELS) as (keyof Peak)[]).map((k) => ({
    name: PEAK_LABELS[k],
    val: agg.peak[k],
  }));
  const peakSum = peakEntries.reduce((s, e) => s + e.val, 0) || 1;
  const peakMax = Math.max(...peakEntries.map((e) => e.val));

  return (
    <div className="min-h-full bg-[#F6F4EF] text-[#1C2420]">
      {/* 상단 바 */}
      <div className="pt-safe sticky top-0 z-20 border-b border-[#E4E0D6] bg-[#F6F4EF]/90 backdrop-blur">
        <div className="flex h-12 items-center gap-2 px-4">
          <Link href="/" aria-label="뒤로" className="text-xl active:scale-90">
            ←
          </Link>
          <span className="text-base font-extrabold">내 실적</span>
        </div>
      </div>

      <div className="px-4 pb-6 pt-4">
        {/* 프로필 */}
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-extrabold tracking-tight">
              {SLA_PROFILE.name}
            </div>
            <div className="text-xs tabular-nums text-[#5B6660]">
              {SLA_PROFILE.uid}
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1E9E5A]/10 px-2.5 py-1 text-xs font-semibold text-[#1E9E5A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1E9E5A]" />
            {SLA_PROFILE.status}
          </span>
        </div>
        <div className="mb-3.5 text-xs tabular-nums text-[#5B6660]">
          {SLA_PROFILE.phone}
        </div>

        {/* 기간 탭 */}
        <div className="mb-2 grid grid-cols-3 gap-1 rounded-xl bg-[#EFEBE2] p-1">
          {(Object.keys(PERIOD_META) as Period[]).map((key) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`rounded-lg py-2.5 text-[13px] font-bold transition ${
                key === period
                  ? "bg-white text-[#1C2420] shadow-sm"
                  : "text-[#5B6660]"
              }`}
            >
              {PERIOD_META[key].tab}
            </button>
          ))}
        </div>
        <div className="mb-3.5 text-center text-[11.5px] tabular-nums text-[#5B6660]">
          {rangeLabel(period, records)}
        </div>

        {/* 총 배달건수 배너 */}
        <div className="mb-3.5 flex items-center justify-between rounded-2xl border border-[#E4E0D6] bg-white px-4 py-3.5">
          <div>
            <div className="text-[12.5px] font-semibold text-[#5B6660]">
              {meta.total}
            </div>
            <div className="mt-0.5 text-[11px] text-[#9B9588]">
              완료+거절+배차취소+배달취소 합계 {denom}건 중
            </div>
          </div>
          <div className="text-2xl font-extrabold tabular-nums">
            {agg.completed.total}
            <span className="ml-0.5 text-[13px] font-semibold text-[#5B6660]">
              건
            </span>
          </div>
        </div>

        {/* 수락률 게이지 */}
        <div className="mb-3.5 overflow-hidden rounded-2xl border border-[#E4E0D6] bg-white px-4 pb-3.5 pt-5">
          <div className="mb-0.5 text-[13px] font-bold text-[#5B6660]">
            {meta.gauge}
          </div>
          <div className="relative flex justify-center">
            <SlaGauge value={rate} />
            <div className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-[40%] text-center">
              <span className="block text-[42px] font-extrabold leading-none tabular-nums">
                {rate}
                <span className="text-xs font-semibold text-[#5B6660]">%</span>
              </span>
            </div>
          </div>
          <div className="flex justify-center">
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{ color: gi.c, background: gi.bg }}
            >
              {gi.text}
            </span>
          </div>
          <div className="mt-1.5 text-center text-[11px] text-[#9B9588]">
            완료 {agg.completed.total} ÷ (완료+거절+배차취소+배달취소 {denom})
          </div>
        </div>

        {/* 통계 그리드 */}
        <div className="mb-3.5 grid grid-cols-2 gap-2.5">
          <StatCard label="완료" dot="#1E9E5A" m={agg.completed} />
          <StatCard label="거절" dot="#D9342B" m={agg.rejected} />
          <StatCard label="배차취소" dot="#E8590C" m={agg.dispatch_cancel} />
          <StatCard label="배달취소(귀책)" dot="#8C8472" m={agg.delivery_cancel} />
        </div>

        {/* 피크시간대별 */}
        <div className="mb-3.5 rounded-2xl border border-[#E4E0D6] bg-white p-4">
          <div className="mb-3 text-sm font-extrabold">
            피크시간대별 완료 현황
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {peakEntries.map((e) => {
              const share = Math.round((e.val / peakSum) * 100);
              const isMax = e.val === peakMax && peakMax > 0;
              return (
                <div
                  key={e.name}
                  className={`rounded-xl border p-3 ${
                    isMax
                      ? "border-[#0B5FFF]/25 bg-[#0B5FFF]/[0.06]"
                      : "border-[#E4E0D6] bg-[#F6F4EF]"
                  }`}
                >
                  <div className="mb-1.5 text-[11.5px] font-semibold text-[#5B6660]">
                    {e.name}
                  </div>
                  <div
                    className={`text-[22px] font-extrabold leading-none tabular-nums ${
                      isMax ? "text-[#0B5FFF]" : ""
                    }`}
                  >
                    {e.val}
                    <span className="ml-0.5 text-xs font-semibold text-[#5B6660]">
                      건
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] tabular-nums text-[#9B9588]">
                    전체의 {share}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-[11px] leading-relaxed text-[#5B6660]">
          표시된 값은 참고용이며, 정산 기준값은 별도 공지 사항을 따릅니다.
          <br />
          <span className="text-[#9B9588]">* 데모 데이터 — 실제 연동 예정</span>
        </p>
      </div>
    </div>
  );
}
