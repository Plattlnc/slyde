"use client";

import { useState } from "react";
import { CARS } from "@/lib/extra-data";

type Cond = "new" | "used";
type Sort = "price" | "year" | "km";

export default function CarList() {
  const [cond, setCond] = useState<Cond>("new");
  const [sort, setSort] = useState<Sort>("price");

  const list = CARS.filter((c) => c.cond === cond).sort((a, b) => {
    if (sort === "year") return b.year - a.year;
    if (sort === "km") return a.km - b.km;
    return a.price - b.price;
  });
  const sortTxt =
    sort === "year" ? "최신 연식순" : sort === "km" ? "주행 짧은순" : "가격 낮은순";

  const sorts: [Sort, string][] = [
    ["price", "가격 낮은순"],
    ["year", "최신 연식순"],
    ["km", "주행 짧은순"],
  ];

  return (
    <div>
      {/* 신차/중고 탭 */}
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
        {(["new", "used"] as Cond[]).map((c) => (
          <button
            key={c}
            onClick={() => setCond(c)}
            className={`rounded-lg py-2 text-sm font-bold ${
              cond === c ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            {c === "new" ? "신차" : "중고차"}
          </button>
        ))}
      </div>
      <div className="mb-3 flex gap-2">
        {sorts.map(([k, label]) => (
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
        총 {list.length}대 · {sortTxt}
      </p>

      <div className="space-y-3">
        {list.map((c, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div className="relative flex h-28 items-center justify-center bg-slate-50 text-5xl">
              {c.ico}
              <span
                className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${
                  c.cond === "new" ? "bg-slate-900" : "bg-slate-600"
                }`}
              >
                {c.cond === "new" ? "신차" : "중고"}
              </span>
              {c.deal && (
                <span className="absolute right-2 top-2 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  {c.deal}
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-bold text-slate-900">{c.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {c.year}년식
                {c.cond === "used"
                  ? ` · ${c.km.toLocaleString()}km`
                  : " · 신차"}{" "}
                · {c.tags}
              </p>
              <div className="mt-1.5">
                <span className="text-lg font-extrabold text-slate-900">
                  {c.price}
                  <span className="text-xs font-semibold text-slate-500">
                    만원{c.cond === "new" ? "~" : ""}
                  </span>
                </span>
                {c.cond === "new" && (
                  <span className="ml-2 text-xs text-slate-400">
                    리스 월 {c.monthly}만원~
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
