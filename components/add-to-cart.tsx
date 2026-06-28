"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";

export default function AddToCart({ productId }: { productId: string }) {
  const { add } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  return (
    <div className="flex gap-2">
      <button
        onClick={() => {
          add(productId);
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        className="flex-1 rounded-xl border border-slate-300 bg-white py-3 text-sm font-bold text-slate-800 active:scale-[0.98]"
      >
        {added ? "담겼어요 ✓" : "장바구니 담기"}
      </button>
      <button
        onClick={() => {
          add(productId);
          router.push("/shop/cart");
        }}
        className="flex-1 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white active:scale-[0.98]"
      >
        바로 구매
      </button>
    </div>
  );
}
