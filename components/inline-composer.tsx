"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { CurrentProfile } from "@/lib/profile";

// 홈에서 바로 작성 → 게시 (페이지 이동 없이 인라인)
export default function InlineComposer({
  profile,
}: {
  profile?: CurrentProfile | null;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const avatar = profile?.avatarEmoji ?? "🛵";

  async function post() {
    if (!text.trim() || busy) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("posts")
      .insert({ content: text.trim() });
    setBusy(false);
    if (error) {
      alert("게시 실패: " + error.message);
      return;
    }
    setText("");
    setOpen(false);
    router.refresh(); // 피드 갱신 → 새 글 바로 표시
  }

  return (
    <div className="border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl">
          {avatar}
        </div>
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setOpen(true)}
            maxLength={1000}
            placeholder="무슨 일이 있나요?"
            className={`w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-slate-400 ${
              open || text ? "min-h-[64px]" : "min-h-[24px]"
            }`}
          />
          {(open || text) && (
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">{text.length}/1000</span>
              <button
                onClick={post}
                disabled={!text.trim() || busy}
                className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-40"
              >
                {busy ? "게시 중…" : "게시"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
