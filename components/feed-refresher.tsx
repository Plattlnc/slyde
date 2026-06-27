"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// 새 글이 올라오면 상단에 "새 글 보기" 알림 (10초 폴링)
export default function FeedRefresher() {
  const router = useRouter();
  const baseRef = useRef<number | null>(null);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function count() {
      const { count } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true });
      return count ?? 0;
    }
    (async () => {
      baseRef.current = await count();
    })();
    const iv = setInterval(async () => {
      const c = await count();
      if (baseRef.current !== null && c > baseRef.current) setHasNew(true);
    }, 10000);
    return () => clearInterval(iv);
  }, []);

  if (!hasNew) return null;

  return (
    <div className="pointer-events-none sticky top-14 z-30 flex justify-center">
      <button
        onClick={() => {
          setHasNew(false);
          baseRef.current = null;
          router.refresh();
        }}
        className="pointer-events-auto rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg active:scale-95"
      >
        ↑ 새 글 보기
      </button>
    </div>
  );
}
