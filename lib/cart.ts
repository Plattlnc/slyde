"use client";

import { useEffect, useState } from "react";

const KEY = "slyde_cart";

export type CartItem = { id: string; qty: number };

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-changed"));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(read());
    const h = () => setItems(read());
    window.addEventListener("cart-changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("cart-changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  return {
    items,
    count: items.reduce((s, i) => s + i.qty, 0),
    add(id: string) {
      const cur = read();
      const f = cur.find((x) => x.id === id);
      if (f) f.qty += 1;
      else cur.push({ id, qty: 1 });
      write(cur);
    },
    setQty(id: string, qty: number) {
      write(
        read()
          .map((x) => (x.id === id ? { ...x, qty } : x))
          .filter((x) => x.qty > 0),
      );
    },
    remove(id: string) {
      write(read().filter((x) => x.id !== id));
    },
    clear() {
      write([]);
    },
  };
}
