"use client";

import { useState } from "react";
import { FOODS, FOOD_CATS } from "@/lib/extra-data";

type Sort = "rate" | "dist" | "review";

export default function FoodList() {
  const [cat, setCat] = useState("전체");
  const [sort, setSort] = useState<Sort>("rate");

  const list = FOODS.filter((f) => cat === "전체" || f.cat === cat).sort(
    (a, b) => {
      if (sort === "dist") return a.dist - b.dist;
      if (sort === "review") return b.review - a.review;
      return b.rate - a.rate;
    },
  );
  const sortTxt =
    sort === "dist" ? "거리순" : sort === "review" ? "리뷰 많은순" : "평점 높은순";

  const sorts: [Sort, string][] = [
    ["rate", "평점 높은순"],
    ["dist", "거리순"],
    ["review", "리뷰 많은순"],
  ];

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">
        라이더들이 자주 가는 곳 (인천 서구 가정동 기준)
      </p>
      <div className="no-scrollbar -mx-4 mb-2 flex gap-2 overflow-x-auto px-4">
        {FOOD_CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
              cat === c
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-500 ring-1 ring-slate-200"
            }`}
          >
            {c}
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
        총 {list.length}곳 · {sortTxt}
      </p>

      <div className="space-y-2">
        {list.map((f) => (
          <div
            key={f.name}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-3xl">
              {f.ico}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-semibold text-slate-900">
                  {f.name}
                </span>
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    f.open
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {f.open ? "영업중" : "영업종료"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{f.cat}</p>
              <p className="text-[11px] text-slate-500">
                <span className="font-semibold text-amber-600">
                  ★ {f.rate.toFixed(1)}
                </span>{" "}
                ({f.review.toLocaleString()}) · 📍 {f.dist}km
              </p>
              <p className="text-[11px] text-slate-500">
                대표 <b className="text-slate-700">{f.menu}</b>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
