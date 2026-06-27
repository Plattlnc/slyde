"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("post_comments")
      .insert({ post_id: postId, content: text.trim() });
    setBusy(false);
    if (error) {
      alert("댓글 실패: " + error.message);
      return;
    }
    setText("");
    router.refresh();
  }

  return (
    <form
      onSubmit={submit}
      className="sticky bottom-0 flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-2.5"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={1000}
        placeholder="댓글 달기…"
        className="flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm outline-none focus:bg-slate-200/70"
      />
      <button
        type="submit"
        disabled={!text.trim() || busy}
        className="shrink-0 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-40"
      >
        {busy ? "…" : "게시"}
      </button>
    </form>
  );
}
