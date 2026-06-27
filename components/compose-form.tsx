"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ComposeForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canPost = text.trim().length > 0 && !loading;

  async function submit() {
    if (!canPost) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    // author_id는 컬럼 default(auth.uid())+트리거가 처리, content만 전달
    const { error } = await supabase
      .from("posts")
      .insert({ content: text.trim() });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-full flex-col bg-white">
      {/* 상단 바 */}
      <div className="pt-safe sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="flex h-12 items-center justify-between px-4">
          <Link href="/" className="text-sm text-slate-500 active:scale-95">
            취소
          </Link>
          <span className="text-sm font-bold text-slate-900">새 글</span>
          <button
            onClick={submit}
            disabled={!canPost}
            className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-40"
          >
            {loading ? "게시 중…" : "게시"}
          </button>
        </div>
      </div>

      {/* 작성 영역 */}
      <div className="flex flex-1 flex-col px-4 py-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl">
            🛵
          </div>
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            placeholder="무슨 일이 있나요? 라이더들과 나눠보세요."
            className="min-h-[200px] flex-1 resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-slate-400"
          />
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
            {error}
          </p>
        )}

        <div className="mt-auto pt-3 text-right text-xs text-slate-400">
          {text.length}/1000
        </div>
      </div>
    </div>
  );
}
