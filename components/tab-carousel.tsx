"use client";

import { Children, useCallback, useEffect, useRef } from "react";

const TABS = ["/", "/shorts", "/messages", "/profile"];

// 네이티브 가로 스크롤-스냅 캐러셀 (손가락 추적·스냅·관성은 브라우저가 처리)
export default function TabCarousel({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial: number;
}) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const idxRef = useRef(initial);
  const panels = Children.toArray(children);

  // 마운트 시 초기 탭으로 즉시 정렬 (깜빡임 방지)
  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      elRef.current = el;
      if (el) {
        el.scrollLeft = initial * el.clientWidth;
        idxRef.current = initial;
      }
    },
    [initial],
  );

  // 초기 정렬 백업 (ref 콜백 시점에 폭이 0이면 대비)
  useEffect(() => {
    const el = elRef.current;
    if (el && el.clientWidth) {
      el.scrollLeft = initial * el.clientWidth;
      idxRef.current = initial;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 스냅 정착 감지 → URL/하단탭 동기화
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    let t: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const w = el.clientWidth || 1;
        const i = Math.round(el.scrollLeft / w);
        if (i !== idxRef.current && i >= 0 && i < TABS.length) {
          idxRef.current = i;
          // URL은 바꾸지 않음 (Next가 가로채 라우트 변경→리마운트→되돌아감 방지)
          window.dispatchEvent(new CustomEvent("slyde:tab", { detail: i }));
        }
      }, 100);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  // 하단탭에서 탭 선택 → 해당 패널로 부드럽게 스크롤
  useEffect(() => {
    const h = (e: Event) => {
      const i = (e as CustomEvent<number>).detail;
      const el = elRef.current;
      if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    };
    window.addEventListener("slyde:goto-tab", h);
    return () => window.removeEventListener("slyde:goto-tab", h);
  }, []);

  // 리사이즈 시 현재 패널 정렬 유지
  useEffect(() => {
    const onResize = () => {
      const el = elRef.current;
      if (el) el.scrollLeft = idxRef.current * el.clientWidth;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div
      ref={setRef}
      className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain"
    >
      {panels.map((p, i) => (
        <div
          key={i}
          className="h-full w-full shrink-0 snap-start overflow-y-auto overscroll-contain"
        >
          {p}
        </div>
      ))}
    </div>
  );
}
