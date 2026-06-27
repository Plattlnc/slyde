"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

// 게시글 첨부 사진 그리드 + 클릭 시 라이트박스(크게 보기)
export default function PostImages({ images }: { images?: string[] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!images || images.length === 0) return null;

  const grid =
    images.length === 1 ? (
      <div className="mt-2.5 overflow-hidden rounded-2xl border border-slate-100">
        <img
          src={images[0]}
          alt="첨부 사진"
          onClick={() => setOpen(images[0])}
          className="max-h-96 w-full cursor-pointer object-cover"
        />
      </div>
    ) : (
      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
        {images.map((u, i) => (
          <img
            key={i}
            src={u}
            alt="첨부 사진"
            onClick={() => setOpen(u)}
            className="aspect-square w-full cursor-pointer rounded-xl object-cover"
          />
        ))}
      </div>
    );

  return (
    <>
      {grid}
      {open && (
        <div
          onClick={() => setOpen(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
        >
          <button
            aria-label="닫기"
            className="absolute right-4 top-4 text-2xl text-white/80"
          >
            ✕
          </button>
          <img
            src={open}
            alt="사진"
            className="max-h-[90vh] max-w-full object-contain"
          />
        </div>
      )}
    </>
  );
}
