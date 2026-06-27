"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const TABS = ["/", "/shorts", "/messages", "/profile"];

// 손가락 추적 드래그로 메인 탭 전환 (가로 축 고정 → 위아래 끌림 방지)
export default function SwipePager({
  children,
}: {
  children: React.ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  useEffect(() => {
    TABS.forEach((t) => router.prefetch(t));
  }, [router]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let sx = 0;
    let sy = 0;
    let axis: "none" | "h" | "v" = "none";
    let d = 0;
    let w = 0;
    let on = false;

    const flags = () => {
      const ww = window as unknown as {
        __slydeModalOpen?: boolean;
        __slydeMenuOpen?: boolean;
      };
      return { modal: !!ww.__slydeModalOpen, menu: !!ww.__slydeMenuOpen };
    };

    function start(e: TouchEvent) {
      if (flags().modal) {
        on = false;
        return;
      }
      on = true;
      const t = e.touches[0];
      sx = t.clientX;
      sy = t.clientY;
      axis = "none";
      d = 0;
      w = el!.offsetWidth || window.innerWidth;
      el!.style.transition = "none";
    }

    function move(e: TouchEvent) {
      if (!on) return;
      const t = e.touches[0];
      const mx = t.clientX - sx;
      const my = t.clientY - sy;
      if (axis === "none") {
        if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
        axis = Math.abs(mx) > Math.abs(my) ? "h" : "v";
      }
      if (axis !== "h") return; // 세로 스와이프 → 네이티브 스크롤 허용
      if (flags().menu) return;
      const idx = TABS.indexOf(pathRef.current);
      if (idx === -1) return;
      e.preventDefault(); // 가로 축 고정 → 위아래 끌림 차단
      d = mx;
      let mv = mx;
      if (idx === 0 && mx > 0) mv = mx * 0.6;
      if (idx === TABS.length - 1 && mx < 0) mv = mx * 0.35;
      el!.style.transform = `translateX(${mv}px)`;
    }

    function end() {
      if (!on) return;
      on = false;
      if (axis !== "h") return;
      const idx = TABS.indexOf(pathRef.current);
      el!.style.transition = "transform .2s ease-out";
      const reset = () => {
        el!.style.transform = "translateX(0)";
      };
      if (flags().menu || idx === -1) return reset();
      const th = w * 0.25;
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

    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchmove", move, { passive: false });
    el.addEventListener("touchend", end, { passive: true });
    return () => {
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchmove", move);
      el.removeEventListener("touchend", end);
    };
  }, [router]);

  return (
    <div ref={wrapRef} className="h-full">
      {children}
    </div>
  );
}
