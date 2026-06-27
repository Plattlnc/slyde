"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/avatar";

type SC = {
  id: string;
  author: string;
  avatar: string;
  avatarUrl: string | null;
  text: string;
  likeCount: number;
  likedByMe: boolean;
};

export default function ShortCommentSheet({
  shortId,
  open,
  onClose,
  me,
  onAdded,
}: {
  shortId: string;
  open: boolean;
  onClose: () => void;
  me: { name: string; avatar: string; avatarUrl: string | null };
  onAdded: () => void;
}) {
  const [comments, setComments] = useState<SC[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("short_comments")
        .select("id, author_id, author_name, content, created_at, like_count")
        .eq("short_id", shortId)
        .order("created_at", { ascending: true });
      const rows = data ?? [];
      // 내가 좋아요한 댓글
      let likedSet = new Set<string>();
      if (user && rows.length) {
        const { data: likes } = await supabase
          .from("short_comment_likes")
          .select("comment_id")
          .eq("user_id", user.id)
          .in(
            "comment_id",
            rows.map((r) => r.id as string),
          );
        likedSet = new Set((likes ?? []).map((l) => l.comment_id as string));
      }
      const ids = [...new Set(rows.map((r) => r.author_id as string))];
      const aMap = new Map<string, { avatar: string; avatar_url: string | null }>();
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, avatar, avatar_url")
          .in("id", ids);
        (profs ?? []).forEach((p) =>
          aMap.set(p.id as string, {
            avatar: (p.avatar as string) ?? "🛵",
            avatar_url: (p.avatar_url as string) ?? null,
          }),
        );
      }
      if (cancelled) return;
      setComments(
        rows.map((c) => ({
          id: c.id as string,
          author: (c.author_name as string) ?? "라이더",
          avatar: aMap.get(c.author_id as string)?.avatar ?? "🛵",
          avatarUrl: aMap.get(c.author_id as string)?.avatar_url ?? null,
          text: c.content as string,
          likeCount: (c.like_count as number) ?? 0,
          likedByMe: likedSet.has(c.id as string),
        })),
      );
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, shortId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("short_comments")
      .insert({ short_id: shortId, content: body })
      .select("id")
      .single();
    setBusy(false);
    if (error) {
      alert("댓글 실패: " + error.message);
      return;
    }
    setText("");
    onAdded();
    if (data)
      setComments((prev) => [
        ...prev,
        {
          id: data.id as string,
          author: me.name,
          avatar: me.avatar,
          avatarUrl: me.avatarUrl,
          text: body,
          likeCount: 0,
          likedByMe: false,
        },
      ]);
  }

  async function toggleLike(id: string) {
    const c = comments.find((x) => x.id === id);
    if (!c) return;
    const next = !c.likedByMe;
    setComments((prev) =>
      prev.map((x) =>
        x.id === id
          ? { ...x, likedByMe: next, likeCount: x.likeCount + (next ? 1 : -1) }
          : x,
      ),
    );
    const supabase = createClient();
    const { error } = next
      ? await supabase.from("short_comment_likes").insert({ comment_id: id })
      : await supabase
          .from("short_comment_likes")
          .delete()
          .eq("comment_id", id);
    if (error) {
      setComments((prev) =>
        prev.map((x) =>
          x.id === id
            ? {
                ...x,
                likedByMe: !next,
                likeCount: x.likeCount + (next ? -1 : 1),
              }
            : x,
        ),
      );
    }
  }

  return (
    <div
      className={`absolute inset-0 z-30 flex flex-col justify-end ${
        open ? "" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* 딤 */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* 시트 */}
      <div
        className={`relative max-h-[70%] rounded-t-2xl bg-white transition-transform duration-200 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <span className="text-sm font-bold text-slate-900">
            댓글 {comments.length}
          </span>
          <button onClick={onClose} className="text-slate-400">
            ✕
          </button>
        </div>

        <div className="max-h-[46vh] overflow-y-auto">
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-400">불러오는 중…</p>
          ) : comments.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              첫 댓글을 남겨보세요
            </p>
          ) : (
            <div className="divide-y divide-slate-50">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3 px-4 py-3">
                  <Avatar
                    url={c.avatarUrl}
                    emoji={c.avatar}
                    className="h-8 w-8"
                    emojiClass="text-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {c.author}
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-slate-800">
                      {c.text}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleLike(c.id)}
                    aria-label="좋아요"
                    className="flex shrink-0 flex-col items-center gap-0.5 pt-0.5 text-slate-500 active:scale-90"
                  >
                    <span className="text-sm">{c.likedByMe ? "❤️" : "🤍"}</span>
                    {c.likeCount > 0 && (
                      <span className="text-[11px]">{c.likeCount}</span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={send}
          className="pb-safe flex items-center gap-2 border-t border-slate-200 px-4 py-2.5"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="댓글 달기…"
            className="flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={!text.trim() || busy}
            className="shrink-0 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
          >
            게시
          </button>
        </form>
      </div>
    </div>
  );
}
