"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";

// 게시글 첨부 사진 그리드 + 라이트박스(좌우 스와이프로 넘기기)
export default function PostImages({ images }: { images?: string[] }) {
  const [idx, setIdx] = useState<number | null>(null);
  const startX = useRef(0);
  const swiped = useRef(false);

  // 라이트박스 열림 동안 탭 스와이프 잠금
  useEffect(() => {
    (window as unknown as { __slydeModalOpen?: boolean }).__slydeModalOpen =
      idx !== null;
    return () => {
      (window as unknown as { __slydeModalOpen?: boolean }).__slydeModalOpen =
        false;
    };
  }, [idx]);

  if (!images || images.length === 0) return null;

  const grid =
    images.length === 1 ? (
      <div className="mt-2.5 overflow-hidden rounded-2xl border border-slate-100">
        <img
          src={images[0]}
          alt="첨부 사진"
          onClick={() => setIdx(0)}
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
            onClick={() => setIdx(i)}
            className="aspect-square w-full cursor-pointer rounded-xl object-cover"
          />
        ))}
      </div>
    );

  function go(dir: number) {
    setIdx((cur) => {
      if (cur === null) return cur;
      const n = cur + dir;
      return n < 0 || n >= images!.length ? cur : n;
    });
  }

  return (
    <>
      {grid}
      {idx !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
          onClick={() => {
            if (swiped.current) {
              swiped.current = false;
              return;
            }
            setIdx(null);
          }}
          onTouchStart={(e) => {
            startX.current = e.touches[0].clientX;
            swiped.current = false;
          }}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - startX.current;
            if (Math.abs(dx) > 50) {
              swiped.current = true;
              go(dx < 0 ? 1 : -1);
            }
          }}
        >
          <button
            aria-label="닫기"
            className="absolute right-4 top-4 z-10 text-2xl text-white/80"
          >
            ✕
          </button>
          <img
            src={images[idx]}
            alt="사진"
            className="max-h-[90vh] max-w-full select-none object-contain"
            draggable={false}
          />
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
              {idx + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
