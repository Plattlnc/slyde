"use client";

import { useState } from "react";
import { GAS_STATIONS } from "@/lib/extra-data";

type Sort = "price" | "dist" | "diesel";

export default function GasList() {
  const [sort, setSort] = useState<Sort>("price");

  const list = [...GAS_STATIONS].sort((a, b) => {
    if (sort === "dist") return a.dist - b.dist;
    if (sort === "diesel") return a.diesel - b.diesel;
    return a.gasoline - b.gasoline;
  });
  const lowVal =
    sort === "dist"
      ? null
      : Math.min(...list.map((s) => (sort === "diesel" ? s.diesel : s.gasoline)));
  const metaTxt =
    sort === "dist"
      ? "가까운 순"
      : sort === "diesel"
        ? "경유 낮은순"
        : "휘발유 낮은순";

  const tabs: [Sort, string][] = [
    ["price", "가격 낮은순"],
    ["dist", "거리순"],
    ["diesel", "경유 낮은순"],
  ];

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        인천 서구 가정동 기준 · 휘발유/경유 가격
      </p>
      <div className="mb-3 flex gap-2">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setSort(k)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              sort === k
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-500 ring-1 ring-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mb-2 text-xs text-slate-400">
        총 {list.length}곳 · {metaTxt}
      </p>

      <div className="space-y-2">
        {list.map((s) => {
          const main = sort === "diesel" ? s.diesel : s.gasoline;
          const isLow = lowVal !== null && main === lowVal;
          const mainLabel = sort === "diesel" ? "경유" : "휘발유";
          const sub =
            sort === "diesel"
              ? `휘발유 ${s.gasoline.toLocaleString()}`
              : `경유 ${s.diesel.toLocaleString()}`;
          return (
            <div
              key={s.name}
              className={`flex items-center gap-3 rounded-2xl border bg-white p-3 ${
                isLow ? "border-rose-300 ring-1 ring-rose-100" : "border-slate-200"
              }`}
            >
              <span className="text-2xl">{s.ico}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-slate-900">
                    {s.name}
                  </span>
                  {isLow && (
                    <span className="shrink-0 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      최저가
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">{s.brand}</p>
                <p className="text-[11px] text-slate-400">
                  📍 {s.dist}km · {sub}원
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-slate-900">
                  {main.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400">
                  {mainLabel} · 원/L
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
