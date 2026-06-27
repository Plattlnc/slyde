"use client";

import { useState } from "react";
import Link from "next/link";
import {
  newsArticles,
  NEWS_CATEGORIES,
  categoryColor,
  type NewsCategory,
} from "@/lib/news-data";

export default function NewsList() {
  const [cat, setCat] = useState<NewsCategory | "전체">("전체");
  const list =
    cat === "전체" ? newsArticles : newsArticles.filter((a) => a.category === cat);

  return (
    <div>
      {/* 카테고리 탭 */}
      <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
        {(["전체", ...NEWS_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              cat === c
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-500 ring-1 ring-slate-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {list.map((a) => (
          <Link
            key={a.id}
            href={`/news/${a.id}`}
            className="block rounded-2xl border border-slate-200 bg-white p-4 active:bg-slate-50"
          >
            <div className="mb-1.5 flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryColor[a.category]}`}
              >
                {a.category}
              </span>
              <span className="text-[11px] text-slate-400">
                {a.source} · {a.date}
              </span>
            </div>
            <h3 className="text-sm font-bold leading-snug text-slate-900">
              {a.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
              {a.summary}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
