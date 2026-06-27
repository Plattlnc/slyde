"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/avatar";
import type { Comment } from "@/lib/posts";

export default function CommentSection({
  postId,
  initial,
  me,
}: {
  postId: string;
  initial: Comment[];
  me: { name: string; avatar: string; avatarUrl: string | null };
}) {
  const [comments, setComments] = useState<Comment[]>(initial);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const top = comments.filter((c) => !c.parentId);
  const repliesOf = (id: string) => comments.filter((c) => c.parentId === id);

  async function add(content: string, parentId: string | null) {
    const body = content.trim();
    if (!body) return;
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("post_comments")
      .insert({ post_id: postId, content: body, parent_id: parentId })
      .select("id, created_at")
      .single();
    setBusy(false);
    if (error) {
      alert("댓글 실패: " + error.message);
      return;
    }
    if (data) {
      setComments((prev) => [
        ...prev,
        {
          id: data.id as string,
          author: me.name,
          avatar: me.avatar,
          avatarUrl: me.avatarUrl,
          text: body,
          time: "방금",
          mine: true,
          parentId,
          likeCount: 0,
          likedByMe: false,
        },
      ]);
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
      ? await supabase.from("comment_likes").insert({ comment_id: id })
      : await supabase.from("comment_likes").delete().eq("comment_id", id);
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

  function Row({ c, isReply }: { c: Comment; isReply?: boolean }) {
    return (
      <div className={`flex gap-3 bg-white px-4 py-3 ${isReply ? "pl-12" : ""}`}>
        <Avatar
          url={c.avatarUrl}
          emoji={c.avatar}
          className={isReply ? "h-7 w-7" : "h-8 w-8"}
          emojiClass="text-sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-slate-900">
              {c.author}
            </span>
            <span className="text-xs text-slate-400">{c.time}</span>
          </div>
          <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-800">
            {c.text}
          </p>
          <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
            <button
              onClick={() => toggleLike(c.id)}
              className="flex items-center gap-1 active:scale-90"
            >
              <span>{c.likedByMe ? "❤️" : "🤍"}</span>
              {c.likeCount > 0 && (
                <span className={c.likedByMe ? "text-rose-500" : ""}>
                  {c.likeCount}
                </span>
              )}
            </button>
            {!isReply && (
              <button
                onClick={() => {
                  setReplyTo(replyTo === c.id ? null : c.id);
                  setReplyText("");
                }}
                className="font-medium active:scale-90"
              >
                답글
              </button>
            )}
          </div>

          {/* 답글 입력 */}
          {!isReply && replyTo === c.id && (
            <div className="mt-2 flex items-center gap-2">
              <input
                autoFocus
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="답글 달기…"
                className="flex-1 rounded-full bg-slate-100 px-3 py-1.5 text-sm outline-none"
              />
              <button
                onClick={async () => {
                  await add(replyText, c.id);
                  setReplyText("");
                  setReplyTo(null);
                }}
                disabled={!replyText.trim() || busy}
                className="shrink-0 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
              >
                게시
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="px-4 py-3 text-xs font-bold text-slate-500">
        댓글 {comments.length}
      </p>
      {top.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-400">
          첫 댓글을 남겨보세요
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {top.map((c) => (
            <div key={c.id}>
              <Row c={c} />
              {repliesOf(c.id).map((r) => (
                <Row key={r.id} c={r} isReply />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* 댓글 입력 */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const t = text;
          setText("");
          await add(t, null);
        }}
        className="pb-safe sticky bottom-0 flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-2.5"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="댓글 달기…"
          className="flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm outline-none focus:bg-slate-200/70"
        />
        <button
          type="submit"
          disabled={!text.trim() || busy}
          className="shrink-0 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-40"
        >
          게시
        </button>
      </form>
    </>
  );
}
