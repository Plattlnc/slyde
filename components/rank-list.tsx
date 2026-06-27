"use client";

import { useState } from "react";
import { RANK_DATA } from "@/lib/extra-data";

type Period = "week" | "month" | "total";

function moveTag(m: number) {
  if (m > 0) return <span className="text-[11px] font-semibold text-rose-500">▲{m}</span>;
  if (m < 0) return <span className="text-[11px] font-semibold text-blue-500">▼{-m}</span>;
  return <span className="text-[11px] text-slate-400">–</span>;
}

export default function RankList() {
  const [period, setPeriod] = useState<Period>("week");
  const list = RANK_DATA[period];
  const myIdx = list.findIndex((r) => r.me);

  const podOrder = [1, 0, 2]; // 2위, 1위, 3위
  const podStyle = ["mt-5", "mt-0", "mt-8"];
  const crown = ["🥈", "👑", "🥉"];

  const periods: [Period, string][] = [
    ["week", "주간"],
    ["month", "월간"],
    ["total", "누적"],
  ];

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">slyde 이용 라이더 배달 건수 순위</p>

      <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
        {periods.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setPeriod(k)}
            className={`rounded-lg py-2 text-sm font-bold ${
              period === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 내 순위 */}
      <div className="mb-4 flex items-center justify-between rounded-xl bg-blue-600 px-4 py-3 text-white">
        <span className="text-sm font-semibold">내 순위 (환타)</span>
        <span className="text-base font-extrabold">
          {myIdx >= 0 ? `${myIdx + 1}위` : "순위권 밖"}
        </span>
      </div>

      {/* 포디움 */}
      <div className="mb-4 flex items-end justify-center gap-3">
        {podOrder.map((idx, i) => {
          const r = list[idx];
          return (
            <div
              key={idx}
              className={`flex w-[28%] flex-col items-center ${podStyle[i]}`}
            >
              <div className="text-2xl">{crown[i]}</div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl">
                {r.ico}
              </div>
              <div className="mt-1 truncate text-xs font-bold text-slate-900">
                {r.name}
              </div>
              <div className="text-[11px] text-slate-500">
                {r.cnt.toLocaleString()}건
              </div>
              <div
                className={`mt-1 flex h-8 w-full items-center justify-center rounded-t-lg text-sm font-extrabold text-white ${
                  i === 1 ? "bg-amber-400" : i === 0 ? "bg-slate-400" : "bg-orange-400"
                }`}
              >
                {idx + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4위 이하 */}
      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {list.slice(3).map((r, i) => (
          <div
            key={r.name}
            className={`flex items-center gap-3 px-4 py-3 ${r.me ? "bg-blue-50" : ""}`}
          >
            <div className="w-6 text-center text-sm font-bold text-slate-500">
              {i + 4}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg">
              {r.ico}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-semibold text-slate-900">
                  {r.name}
                </span>
                {r.me && (
                  <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    나
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">{r.center}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-900">
                {r.cnt.toLocaleString()}
                <span className="text-[11px] font-normal text-slate-400">건</span>
              </div>
              {moveTag(r.move)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
