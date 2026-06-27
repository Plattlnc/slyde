"use client";

import { useState } from "react";
import Link from "next/link";
import { leasePlans, LEASE_CHIPS, matchChip, won } from "@/lib/lease-data";

export default function LeaseList() {
  const [chip, setChip] = useState("전체");
  const list = leasePlans.filter((p) => matchChip(p, chip));

  return (
    <div>
      <p className="text-sm font-bold text-slate-800">배달용 이륜차 비교</p>
      <p className="mb-3 text-xs text-slate-500">
        총 {leasePlans.length}개 업체 · 가격 낮은 순
      </p>

      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
        {LEASE_CHIPS.map((c) => (
          <button
            key={c}
            onClick={() => setChip(c)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
              chip === c
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-500 ring-1 ring-slate-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.map((p) => (
          <div
            key={p.id}
            className={`rounded-2xl border bg-white p-4 ${
              p.best ? "border-blue-300 ring-1 ring-blue-100" : "border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-2xl">
                {p.emoji}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">{p.name}</span>
                  {p.best && (
                    <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      BEST
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-slate-500">{p.sub}</p>
              </div>
            </div>

            <div className="mt-3">
              <span className="text-xl font-extrabold text-slate-900">
                {won(p.price)}
              </span>
              <span className="text-xs text-slate-500"> / {p.unit}~</span>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <Link
                href={`/lease/${p.id}`}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-center text-sm font-semibold text-slate-700 active:scale-[0.98]"
              >
                상세 보기
              </Link>
              <Link
                href={`/lease/${p.id}`}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-center text-sm font-bold text-white active:scale-[0.98]"
              >
                문의하기
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
