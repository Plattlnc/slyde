"use client";

import { useState } from "react";
import Link from "next/link";
import {
  aggregate,
  acceptanceRate,
  gaugeColor,
  rangeForPeriod,
  PERIOD_META,
  type Period,
} from "@/lib/sla-data";

// 협력사 공동목표 (샘플 — 추후 실데이터 연동)
const ACHIEVEMENTS = [
  { name: "오전피크", ico: "🌅", score: 3, done: 752, target: 558 },
  { name: "오후피크", ico: "☀️", score: 2, done: 496, target: 396 },
  { name: "저녁피크", ico: "🌆", score: 3, done: 685, target: 648 },
  { name: "심야피크", ico: "🌙", score: 2, done: 831, target: 558 },
];

const STATS: { key: 0 | 1 | 2 | 3; label: string; dot: string }[] = [
  { key: 0, label: "완료", dot: "#1E9E5A" },
  { key: 1, label: "거절", dot: "#D9342B" },
  { key: 2, label: "배차취소", dot: "#E8590C" },
  { key: 3, label: "배달취소", dot: "#8C8472" },
];

const PEAK_SHORT = ["아침점심", "오후", "저녁", "심야"];
const AVG_PER_DELIVERY = 3200; // 건당 예상 수입(데모)

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("today");
  const agg = aggregate(rangeForPeriod(period));
  const { rate } = acceptanceRate(agg);
  const tag = gaugeColor(rate);
  const meta = PERIOD_META[period];

  const sVals = [
    agg.completed.total,
    agg.rejected.total,
    agg.dispatch_cancel.total,
    agg.delivery_cancel.total,
  ];
  const pVals = [
    agg.peak.morning_lunch,
    agg.peak.afternoon_offpeak,
    agg.peak.evening,
    agg.peak.midnight_offpeak,
  ];
  const peakMax = Math.max(...pVals);
  const amount = agg.completed.total * AVG_PER_DELIVERY;

  return (
    <div className="min-h-full bg-slate-50">
      {/* 상단 바 */}
      <header className="pt-safe sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
        <div className="flex h-12 items-center gap-2 px-4">
          <Link href="/" aria-label="뒤로" className="text-xl active:scale-90">
            ←
          </Link>
          <span className="text-base font-extrabold text-slate-900">내 실적</span>
        </div>
      </header>

      <div className="space-y-3 px-4 py-4">
        {/* 기간 탭 */}
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
          {(Object.keys(PERIOD_META) as Period[]).map((k) => (
            <button
              key={k}
              onClick={() => setPeriod(k)}
              className={`rounded-lg py-2 text-sm font-bold transition ${
                period === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              {PERIOD_META[k].tab}
            </button>
          ))}
        </div>

        {/* 총 배달건수 배너 */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5">
          <span className="text-[13px] font-semibold text-slate-500">
            {meta.total}
          </span>
          <span className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold tabular-nums text-slate-900">
              {sVals[0]}
            </span>
            <span className="text-sm text-slate-500">건</span>
            <span className="ml-1 text-sm font-semibold text-slate-400">
              / ₩{amount.toLocaleString()}
            </span>
          </span>
        </div>

        {/* 수락률 배너 */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5">
          <span className="text-[13px] font-semibold text-slate-500">
            {meta.gauge}
          </span>
          <span className="flex items-center gap-2.5">
            <span className="text-2xl font-extrabold tabular-nums text-slate-900">
              {rate}%
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{ color: tag.c, background: tag.bg }}
            >
              {tag.text}
            </span>
          </span>
        </div>

        {/* 통계 + 피크 카드 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-4 gap-2">
            {STATS.map((s) => (
              <div key={s.key} className="text-center">
                <div className="flex items-center justify-center gap-1 text-[11.5px] text-slate-500">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: s.dot }}
                  />
                  {s.label}
                </div>
                <div className="mt-1 text-xl font-extrabold tabular-nums text-slate-900">
                  {sVals[s.key]}
                </div>
              </div>
            ))}
          </div>
          <div className="my-3 border-t border-slate-100" />
          <div className="grid grid-cols-4 gap-2">
            {PEAK_SHORT.map((label, i) => {
              const isMax = pVals[i] === peakMax && peakMax > 0;
              return (
                <div
                  key={label}
                  className={`rounded-xl py-2 text-center ${
                    isMax ? "bg-slate-100" : ""
                  }`}
                >
                  <div className="text-[11.5px] text-slate-500">{label}</div>
                  <div
                    className={`mt-0.5 text-lg font-extrabold tabular-nums ${
                      isMax ? "text-slate-900" : "text-slate-900"
                    }`}
                  >
                    {pVals[i]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 구간별 달성률 · 협력사 공동목표 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-extrabold text-slate-900">
            구간별 달성률 · 협력사 공동목표
          </p>
          <div className="space-y-3">
            {ACHIEVEMENTS.map((a) => {
              const pct = Math.round((a.done / a.target) * 100);
              return (
                <div key={a.name} className="flex items-center gap-3">
                  <div className="flex w-12 shrink-0 flex-col items-center">
                    <span className="text-[11px] font-bold text-emerald-600">
                      +{a.score}점
                    </span>
                    <span className="text-xl">{a.ico}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-semibold text-slate-800">
                        {a.name}
                      </span>
                      <span className="text-xs tabular-nums text-slate-500">
                        <b className="text-slate-900">{a.done}</b> / {a.target}건
                        <b className="ml-1 text-slate-900">{pct}%</b>
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-800"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400">
          * 데모 데이터 — 실제 운행/협력사 데이터 연동 예정
        </p>
      </div>
    </div>
  );
}
