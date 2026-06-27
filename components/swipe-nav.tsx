"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

// 좌우 스와이프로 이동할 메인 탭 순서 (＋ 만들기는 제외)
const TABS = ["/", "/shorts", "/messages", "/profile"];

export default function SwipeNav() {
  const pathname = usePathname();
  const router = useRouter();

  // 탭 미리 가져오기 (스와이프 반응 빠르게)
  useEffect(() => {
    TABS.forEach((t) => router.prefetch(t));
  }, [router]);

  useEffect(() => {
    const idx = TABS.indexOf(pathname);
    if (idx === -1) return; // 메인 탭에서만 동작

    let startX = 0;
    let startY = 0;
    let startT = 0;

    function onStart(e: TouchEvent) {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      startT = Date.now();
    }
    function onEnd(e: TouchEvent) {
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      const dt = Date.now() - startT;
      // 빠르고, 가로 이동이 세로보다 확실히 큰 경우만
      if (dt < 600 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) {
        const menuOpen = (window as unknown as { __slydeMenuOpen?: boolean })
          .__slydeMenuOpen;
        // 메뉴 열려있으면: 왼쪽 스와이프로 닫기만, 탭 이동은 안 함
        if (menuOpen) {
          if (dx < 0) window.dispatchEvent(new Event("slyde:close-menu"));
          return;
        }
        if (dx < 0 && idx < TABS.length - 1) {
          router.push(TABS[idx + 1]); // 왼쪽 스와이프 → 다음 탭
        } else if (dx > 0) {
          if (idx > 0)
            router.push(TABS[idx - 1]); // 오른쪽 스와이프 → 이전 탭
          else if (pathname === "/")
            window.dispatchEvent(new Event("slyde:open-menu")); // 홈에서 → 메뉴 열기
        }
      }
    }

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [pathname, router]);

  return null;
}
