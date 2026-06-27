"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Avatar from "@/components/avatar";
import {
  MenuIcon,
  ChartIcon,
  TrophyIcon,
  AlertIcon,
  WrenchIcon,
  KeyIcon,
  CarIcon,
  BagIcon,
  FuelIcon,
  FoodIcon,
  NewsIcon,
  BuildingIcon,
} from "@/components/icons";
import type { CurrentProfile } from "@/lib/profile";

const menuSections = [
  {
    title: "내 활동",
    items: [
      { href: "/dashboard", label: "내 실적", Icon: ChartIcon },
      { href: "/rank", label: "랭킹 순위", Icon: TrophyIcon },
    ],
  },
  {
    title: "사고 · 안전",
    items: [
      { href: "/accident", label: "사고접수", Icon: AlertIcon },
      { href: "/centers", label: "내 주변 정비소", Icon: WrenchIcon },
    ],
  },
  {
    title: "차량 · 장비",
    items: [
      { href: "/lease", label: "리스/렌탈", Icon: KeyIcon },
      { href: "/cars", label: "신차/중고차", Icon: CarIcon },
      { href: "/shop", label: "라이더 용품샵", Icon: BagIcon },
    ],
  },
  {
    title: "주변 정보",
    items: [
      { href: "/gas", label: "내 주변 주유소", Icon: FuelIcon },
      { href: "/food", label: "내 주변 맛집", Icon: FoodIcon },
    ],
  },
  {
    title: "소식 · 커뮤니티",
    items: [
      { href: "/news", label: "배달뉴스", Icon: NewsIcon },
      { href: "/partners", label: "우리지역 협력사", Icon: BuildingIcon },
    ],
  },
];

export default function MenuDrawer({
  profile,
}: {
  profile?: CurrentProfile | null;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const close = () => setOpen(false);

  const name = profile?.name ?? "라이더";
  const company = profile?.company ?? null;
  const avatar = profile?.avatarEmoji ?? "🛵";

  const drawerStartX = useRef(0);

  useEffect(() => setMounted(true), []);

  // 스와이프 등 외부에서 메뉴 열기/닫기 신호
  useEffect(() => {
    const openH = () => setOpen(true);
    const closeH = () => setOpen(false);
    window.addEventListener("slyde:open-menu", openH);
    window.addEventListener("slyde:close-menu", closeH);
    return () => {
      window.removeEventListener("slyde:open-menu", openH);
      window.removeEventListener("slyde:close-menu", closeH);
    };
  }, []);

  // 열림 상태를 전역 플래그로 (SwipeNav가 참조)
  useEffect(() => {
    (window as unknown as { __slydeMenuOpen?: boolean }).__slydeMenuOpen = open;
    return () => {
      (window as unknown as { __slydeMenuOpen?: boolean }).__slydeMenuOpen =
        false;
    };
  }, [open]);

  // 열렸을 때 뒤 배경 스크롤 잠금
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const overlay = (
    // body에 포털로 렌더 → 부모 backdrop-blur/transform 영향 없이 뷰포트 기준 고정
    <div
      className={`fixed inset-0 z-[100] flex justify-center ${
        open ? "" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div className="relative w-full max-w-md">
        {/* 배경 딤 */}
        <div
          onClick={close}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* 서랍 */}
        <aside
          onTouchStart={(e) => {
            drawerStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (e.changedTouches[0].clientX - drawerStartX.current < -50)
              close();
          }}
          className={`pt-safe absolute left-0 top-0 flex h-full w-[80%] max-w-xs flex-col bg-white shadow-2xl transition-transform duration-200 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* 헤더: 프로필 */}
          <div className="flex items-center gap-3 bg-gradient-to-b from-blue-600 to-blue-500 px-5 py-5 text-white">
            <Avatar
              url={profile?.avatarUrl}
              emoji={avatar}
              className="h-12 w-12 bg-white/20"
              emojiClass="text-2xl"
            />
            <div>
              <p className="text-base font-bold">{name} 님</p>
              <p className="text-xs text-blue-100">{company || "slyde 라이더"}</p>
            </div>
          </div>

          {/* 메뉴 항목 (섹션별) */}
          <nav className="flex-1 overflow-y-auto py-1">
            {menuSections.map((section) => (
              <div key={section.title} className="py-1">
                <p className="px-5 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  {section.title}
                </p>
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className="flex items-center gap-3 px-5 py-3 text-[15px] font-medium text-slate-700 transition active:bg-slate-50"
                  >
                    <item.Icon size={20} className="text-slate-500" />
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <button
            onClick={close}
            className="border-t border-slate-100 py-3 text-sm text-slate-400 active:bg-slate-50"
          >
            닫기
          </button>
        </aside>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="메뉴"
        aria-expanded={open}
        className="text-slate-700 active:scale-90"
      >
        <MenuIcon size={24} />
      </button>
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
