"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { getProduct, formatWon } from "@/lib/shop-data";

export default function CartPage() {
  const { items, setQty, remove, clear } = useCart();

  const rows = items
    .map((it) => ({ ...it, product: getProduct(it.id) }))
    .filter((r) => r.product);
  const total = rows.reduce((s, r) => s + (r.product!.price * r.qty), 0);

  function order() {
    if (rows.length === 0) return;
    clear();
    alert("주문이 접수됐어요! (데모) 🛵");
  }

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <header className="pt-safe sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
        <div className="flex h-12 items-center gap-2 px-4">
          <Link href="/shop" aria-label="뒤로" className="text-xl active:scale-90">
            ←
          </Link>
          <span className="text-base font-extrabold text-slate-900">장바구니</span>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <div className="text-5xl">🛒</div>
          <p className="text-sm text-slate-500">장바구니가 비어 있어요</p>
          <Link
            href="/shop"
            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white active:scale-95"
          >
            쇼핑하러 가기
          </Link>
        </div>
      ) : (
        <>
          <div className="flex-1 divide-y divide-slate-100">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-3 bg-white px-4 py-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-3xl">
                  {r.product!.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-slate-800">
                    {r.product!.name}
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {formatWon(r.product!.price * r.qty)}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      onClick={() => setQty(r.id, r.qty - 1)}
                      className="h-6 w-6 rounded-full bg-slate-100 text-sm font-bold active:scale-90"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm tabular-nums">
                      {r.qty}
                    </span>
                    <button
                      onClick={() => setQty(r.id, r.qty + 1)}
                      className="h-6 w-6 rounded-full bg-slate-100 text-sm font-bold active:scale-90"
                    >
                      +
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      className="ml-auto text-xs text-slate-400 active:scale-90"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 합계 + 주문 */}
          <div className="pb-safe sticky bottom-0 border-t border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-500">총 결제금액</span>
              <span className="text-lg font-extrabold text-slate-900">
                {formatWon(total)}
              </span>
            </div>
            <button
              onClick={order}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white active:scale-[0.98]"
            >
              주문하기
            </button>
          </div>
        </>
      )}
    </div>
  );
}
