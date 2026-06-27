"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { CurrentProfile } from "@/lib/profile";

const menuItems = [
  { href: "/dashboard", label: "내 실적", emoji: "📊" },
  { href: "/accident", label: "사고접수", emoji: "🚨" },
  { href: "/lease", label: "리스/렌탈", emoji: "🚗" },
  { href: "/news", label: "배달뉴스", emoji: "📰" },
  { href: "/centers", label: "내 주변 정비소", emoji: "🔧" },
  { href: "/shop", label: "라이더 용품샵", emoji: "🛍️" },
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
  const tier = profile?.tier ?? "개인회원";
  const company = profile?.company ?? null;
  const avatar = profile?.avatarEmoji ?? "🛵";

  useEffect(() => setMounted(true), []);

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
          className={`pt-safe absolute left-0 top-0 flex h-full w-[80%] max-w-xs flex-col bg-white shadow-2xl transition-transform duration-200 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* 헤더: 프로필 */}
          <div className="flex items-center gap-3 bg-gradient-to-b from-blue-600 to-blue-500 px-5 py-5 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-2xl">
              {avatar}
            </div>
            <div>
              <p className="text-base font-bold">{name} 님</p>
              <p className="text-xs text-blue-100">
                {tier}
                {company ? ` · ${company}` : ""}
              </p>
            </div>
          </div>

          {/* 메뉴 항목 */}
          <nav className="flex-1 overflow-y-auto py-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="flex items-center gap-3 px-5 py-3.5 text-[15px] font-medium text-slate-700 transition active:bg-slate-50"
              >
                <span className="w-7 text-center text-xl">{item.emoji}</span>
                {item.label}
              </Link>
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
        className="text-slate-600 active:scale-90"
      >
        <span className="text-xl">☰</span>
      </button>
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
