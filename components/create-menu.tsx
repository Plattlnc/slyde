"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

function PlusIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 8v8M8 12h8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function CreateMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => setMounted(true), []);

  const sheet = (
    <div
      className={`fixed inset-0 z-[100] flex justify-center ${
        open ? "" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div className="relative w-full max-w-md">
        <div
          onClick={close}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`pb-safe absolute inset-x-0 bottom-0 rounded-t-3xl bg-white pt-2 transition-transform duration-200 ease-out ${
            open ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-300" />
          <p className="px-5 pb-1 pt-1 text-xs font-bold text-slate-400">
            만들기
          </p>
          <Link
            href="/compose"
            onClick={close}
            className="flex items-center gap-3 px-5 py-4 text-[15px] font-medium text-slate-800 active:bg-slate-50"
          >
            <span className="text-xl">📝</span> 글 쓰기
          </Link>
          <Link
            href="/shorts/new"
            onClick={close}
            className="flex items-center gap-3 px-5 py-4 text-[15px] font-medium text-slate-800 active:bg-slate-50"
          >
            <span className="text-xl">🎬</span> 숏폼 올리기 (사진·영상)
          </Link>
          <button
            onClick={close}
            className="mt-1 w-full border-t border-slate-100 py-3.5 text-sm text-slate-400 active:bg-slate-50"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="만들기"
        aria-expanded={open}
        className="flex h-14 w-full items-center justify-center text-slate-400 active:scale-90"
      >
        <PlusIcon />
      </button>
      {mounted && createPortal(sheet, document.body)}
    </>
  );
}
