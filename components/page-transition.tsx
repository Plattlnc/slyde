"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const TABS = ["/", "/shorts", "/messages", "/profile"];

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const prevRef = useRef(pathname);

  // 렌더 시점에 방향 계산 (prev는 effect에서 갱신)
  let cls = "fade";
  if (prevRef.current !== pathname) {
    const pi = TABS.indexOf(prevRef.current);
    const ci = TABS.indexOf(pathname);
    if (pi !== -1 && ci !== -1 && pi !== ci) {
      cls = ci > pi ? "from-right" : "from-left";
    }
  }

  useEffect(() => {
    prevRef.current = pathname;
  }, [pathname]);

  // key로 리마운트 → 애니메이션 재생
  return (
    <div key={pathname} className={`page-anim ${cls}`}>
      {children}
    </div>
  );
}
