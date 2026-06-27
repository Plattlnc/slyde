"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const TABS = ["/", "/shorts", "/messages", "/profile"];

// 손가락 추적 드래그로 메인 탭 전환 (drag-to-swipe)
export default function SwipePager({
  children,
}: {
  children: React.ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const startX = useRef(0);
  const startY = useRef(0);
  const axis = useRef<"none" | "h" | "v">("none");
  const width = useRef(0);
  const dx = useRef(0);
  const active = useRef(false);

  useEffect(() => {
    TABS.forEach((t) => router.prefetch(t));
  }, [router]);

  function flags() {
    const w = window as unknown as {
      __slydeModalOpen?: boolean;
      __slydeMenuOpen?: boolean;
    };
    return { modal: !!w.__slydeModalOpen, menu: !!w.__slydeMenuOpen };
  }

  function onStart(e: React.TouchEvent) {
    const { modal } = flags();
    if (modal) {
      active.current = false;
      return;
    }
    active.current = true;
    const t = e.touches[0];
    startX.current = t.clientX;
    startY.current = t.clientY;
    axis.current = "none";
    dx.current = 0;
    width.current = wrapRef.current?.offsetWidth || window.innerWidth;
    if (wrapRef.current) wrapRef.current.style.transition = "none";
  }

  function onMove(e: React.TouchEvent) {
    if (!active.current) return;
    const t = e.touches[0];
    const mx = t.clientX - startX.current;
    const my = t.clientY - startY.current;
    if (axis.current === "none") {
      if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
      axis.current = Math.abs(mx) > Math.abs(my) ? "h" : "v";
    }
    if (axis.current !== "h") return;
    const { menu } = flags();
    if (menu) return;
    const idx = TABS.indexOf(pathname);
    if (idx === -1) return;
    dx.current = mx;
    let move = mx;
    // 가장자리 저항: 첫 탭 왼쪽엔(오른쪽 드래그=메뉴) 약하게, 마지막 탭 다음 없음
    if (idx === 0 && mx > 0) move = mx * 0.6;
    if (idx === TABS.length - 1 && mx < 0) move = mx * 0.35;
    if (wrapRef.current)
      wrapRef.current.style.transform = `translateX(${move}px)`;
  }

  function onEnd() {
    if (!active.current) return;
    active.current = false;
    if (axis.current !== "h") return;
    const idx = TABS.indexOf(pathname);
    const el = wrapRef.current;
    if (el) el.style.transition = "transform .2s ease-out";
    const reset = () => {
      if (el) el.style.transform = "translateX(0)";
    };
    const { menu } = flags();
    if (menu || idx === -1) return reset();

    const th = width.current * 0.25;
    const d = dx.current;
    if (d <= -th && idx < TABS.length - 1) {
      router.push(TABS[idx + 1]);
      reset();
    } else if (d >= th && idx > 0) {
      router.push(TABS[idx - 1]);
      reset();
    } else if (d >= th && idx === 0) {
      window.dispatchEvent(new Event("slyde:open-menu"));
      reset();
    } else {
      reset();
    }
  }

  return (
    <div
      ref={wrapRef}
      onTouchStart={onStart}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
      className="h-full"
    >
      {children}
    </div>
  );
}
