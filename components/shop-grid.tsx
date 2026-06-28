"use client";

import { useState } from "react";
import Link from "next/link";
import {
  products,
  SHOP_CATEGORIES,
  formatWon,
  type ShopCategory,
} from "@/lib/shop-data";
import { useCart } from "@/lib/cart";

export default function ShopGrid() {
  const [cat, setCat] = useState<ShopCategory | "전체">("전체");
  const { count } = useCart();
  const list =
    cat === "전체" ? products : products.filter((p) => p.category === cat);

  return (
    <div>
      {/* 장바구니 바로가기 */}
      <Link
        href="/shop/cart"
        className="mb-3 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-2.5 text-white active:scale-[0.99]"
      >
        <span className="text-sm font-semibold">🛒 장바구니</span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
          {count}
        </span>
      </Link>

      {/* 카테고리 */}
      <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
        {(["전체", ...SHOP_CATEGORIES] as const).map((c) => (
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

      {/* 상품 그리드 */}
      <div className="grid grid-cols-2 gap-3">
        {list.map((p) => (
          <Link
            key={p.id}
            href={`/shop/${p.id}`}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white active:scale-[0.99]"
          >
            <div className="relative flex aspect-square items-center justify-center bg-slate-50 text-5xl">
              {p.emoji}
              {p.badge && (
                <span className="absolute left-2 top-2 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">
                  {p.badge}
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="line-clamp-1 text-sm font-medium text-slate-800">
                {p.name}
              </p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">
                {formatWon(p.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
