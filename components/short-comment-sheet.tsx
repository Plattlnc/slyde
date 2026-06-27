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
  parentId: string | null;
  mine: boolean;
};

export default function ShortCommentSheet({
  shortId,
  open,
  onClose,
  me,
  onCount,
}: {
  shortId: string;
  open: boolean;
  onClose: () => void;
  me: { name: string; avatar: string; avatarUrl: string | null };
  onCount: (delta: number) => void;
}) {
  const [comments, setComments] = useState<SC[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<"top" | "new">("top");

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
        .select("id, author_id, author_name, content, created_at, like_count, parent_id")
        .eq("short_id", shortId)
        .order("created_at", { ascending: true });
      const rows = data ?? [];
      let likedSet = new Set<string>();
      if (user && rows.length) {
        const { data: likes } = await supabase
          .from("short_comment_likes")
          .select("comment_id")
          .eq("user_id", user.id)
          .in("comment_id", rows.map((r) => r.id as string));
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
          parentId: (c.parent_id as string) ?? null,
          mine: user ? c.author_id === user.id : false,
        })),
      );
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, shortId]);

  const orderIdx = new Map(comments.map((c, i) => [c.id, i]));
  const top = comments.filter((c) => !c.parentId);
  const sortedTop = [...top].sort((a, b) =>
    sort === "top"
      ? b.likeCount - a.likeCount || orderIdx.get(a.id)! - orderIdx.get(b.id)!
      : orderIdx.get(b.id)! - orderIdx.get(a.id)!,
  );
  const repliesOf = (id: string) =>
    comments.filter((c) => c.parentId === id);

  async function add(content: string, parentId: string | null) {
    const body = content.trim();
    if (!body || busy) return;
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("short_comments")
      .insert({ short_id: shortId, content: body, parent_id: parentId })
      .select("id")
      .single();
    setBusy(false);
    if (error) {
      alert("댓글 실패: " + error.message);
      return;
    }
    onCount(1);
    if (data) {
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
          parentId,
          mine: true,
        },
      ]);
      if (parentId) setExpanded((p) => new Set(p).add(parentId));
    }
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
      : await supabase.from("short_comment_likes").delete().eq("comment_id", id);
    if (error) {
      setComments((prev) =>
        prev.map((x) =>
          x.id === id
            ? { ...x, likedByMe: !next, likeCount: x.likeCount + (next ? -1 : 1) }
            : x,
        ),
      );
    }
  }

  async function remove(id: string) {
    if (!confirm("삭제할까요?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("short_comments").delete().eq("id", id);
    if (error) {
      alert("삭제 실패: " + error.message);
      return;
    }
    const removed = 1 + comments.filter((c) => c.parentId === id).length;
    onCount(-removed);
    setComments((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
  }

  function Actions({ c }: { c: SC }) {
    return (
      <div className="mt-1 flex items-center gap-4 text-slate-500">
        <button
          onClick={() => toggleLike(c.id)}
          className="flex items-center gap-1 active:scale-90"
        >
          <span className="text-base">{c.likedByMe ? "👍" : "👍🏻"}</span>
          {c.likeCount > 0 && <span className="text-xs">{c.likeCount}</span>}
        </button>
        <button
          onClick={() => {
            setReplyTo(c.parentId ?? c.id);
            setReplyText(c.parentId ? `@${c.author} ` : "");
          }}
          className="text-xs font-semibold active:scale-90"
        >
          답글
        </button>
        {c.mine && (
          <button
            onClick={() => remove(c.id)}
            className="text-xs text-slate-400 active:scale-90"
          >
            삭제
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 z-30 flex flex-col justify-end ${
        open ? "" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`relative max-h-[75%] rounded-t-2xl bg-white transition-transform duration-200 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <span className="text-sm font-bold text-slate-900">
            댓글 {comments.length}
          </span>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setSort("top")}
              className={sort === "top" ? "font-bold text-slate-900" : "text-slate-400"}
            >
              인기순
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => setSort("new")}
              className={sort === "new" ? "font-bold text-slate-900" : "text-slate-400"}
            >
              최신순
            </button>
            <button onClick={onClose} className="ml-2 text-slate-400">
              ✕
            </button>
          </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-400">불러오는 중…</p>
          ) : sortedTop.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              첫 댓글을 남겨보세요
            </p>
          ) : (
            sortedTop.map((c) => {
              const replies = repliesOf(c.id);
              const isOpen = expanded.has(c.id);
              return (
                <div key={c.id} className="px-4 py-3">
                  <div className="flex gap-3">
                    <Avatar
                      url={c.avatarUrl}
                      emoji={c.avatar}
                      className="h-8 w-8"
                      emojiClass="text-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500">{c.author}</p>
                      <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-800">
                        {c.text}
                      </p>
                      <Actions c={c} />
                      {replyTo === c.id && (
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            autoFocus
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="답글 추가…"
                            className="flex-1 border-b border-slate-200 pb-1 text-sm outline-none focus:border-slate-900"
                          />
                          <button
                            onClick={() => {
                              setReplyTo(null);
                              setReplyText("");
                            }}
                            className="text-xs text-slate-400"
                          >
                            취소
                          </button>
                          <button
                            onClick={async () => {
                              await add(replyText, c.id);
                              setReplyText("");
                              setReplyTo(null);
                            }}
                            disabled={!replyText.trim() || busy}
                            className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-40"
                          >
                            답글
                          </button>
                        </div>
                      )}
                      {replies.length > 0 && (
                        <button
                          onClick={() =>
                            setExpanded((p) => {
                              const n = new Set(p);
                              n.has(c.id) ? n.delete(c.id) : n.add(c.id);
                              return n;
                            })
                          }
                          className="mt-2 flex items-center gap-1 text-xs font-bold text-blue-600 active:scale-90"
                        >
                          <span>{isOpen ? "▴" : "▾"}</span>
                          답글 {replies.length}개
                        </button>
                      )}
                      {isOpen &&
                        replies.map((r) => (
                          <div key={r.id} className="mt-3 flex gap-2">
                            <Avatar
                              url={r.avatarUrl}
                              emoji={r.avatar}
                              className="h-7 w-7"
                              emojiClass="text-xs"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-slate-500">{r.author}</p>
                              <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-800">
                                {r.text}
                              </p>
                              <Actions c={r} />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const t = text;
            setText("");
            add(t, null);
          }}
          className="pb-safe flex items-center gap-2 border-t border-slate-200 px-4 py-2.5"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="댓글 추가…"
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
