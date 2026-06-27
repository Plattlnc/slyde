"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/avatar";
import { HeartIcon } from "@/components/icons";
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
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<"top" | "new">("top");

  const order = new Map(comments.map((c, i) => [c.id, i])); // 작성순 인덱스
  const top = comments.filter((c) => !c.parentId);
  const sortedTop = [...top].sort((a, b) => {
    if (sort === "top") return b.likeCount - a.likeCount || order.get(a.id)! - order.get(b.id)!;
    return order.get(b.id)! - order.get(a.id)!; // 최신순
  });
  const repliesOf = (id: string) =>
    comments
      .filter((c) => c.parentId === id)
      .sort((a, b) => order.get(a.id)! - order.get(b.id)!);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  async function add(content: string, parentId: string | null) {
    const body = content.trim();
    if (!body) return;
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("post_comments")
      .insert({ post_id: postId, content: body, parent_id: parentId })
      .select("id")
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
      if (parentId) setExpanded((p) => new Set(p).add(parentId)); // 답글 달면 펼침
    }
  }

  async function remove(id: string) {
    if (!confirm("삭제할까요?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("post_comments").delete().eq("id", id);
    if (error) {
      alert("삭제 실패: " + error.message);
      return;
    }
    // 원댓글이면 답글(cascade)도 함께 제거
    setComments((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
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

  function Actions({ c }: { c: Comment }) {
    return (
      <div className="mt-1 flex items-center gap-4 text-slate-500">
        <button
          onClick={() => toggleLike(c.id)}
          className={`flex items-center gap-1 active:scale-90 ${
            c.likedByMe ? "text-rose-500" : ""
          }`}
        >
          <HeartIcon size={15} filled={c.likedByMe} />
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

  const replyInput = (parentId: string) => (
    <div className="mt-2 flex items-center gap-2">
      <Avatar
        url={me.avatarUrl}
        emoji={me.avatar}
        className="h-6 w-6"
        emojiClass="text-xs"
      />
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
          await add(replyText, parentId);
          setReplyText("");
          setReplyTo(null);
        }}
        disabled={!replyText.trim() || busy}
        className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-40"
      >
        답글
      </button>
    </div>
  );

  return (
    <>
      {/* 헤더 + 정렬 */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-bold text-slate-900">
          댓글 {comments.length}개
        </span>
        <div className="flex gap-2 text-xs">
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
        </div>
      </div>

      {sortedTop.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-400">
          첫 댓글을 남겨보세요
        </p>
      ) : (
        <div>
          {sortedTop.map((c) => {
            const replies = repliesOf(c.id);
            const open = expanded.has(c.id);
            return (
              <div key={c.id} className="bg-white px-4 py-3">
                {/* 원댓글 */}
                <div className="flex gap-3">
                  <Avatar
                    url={c.avatarUrl}
                    emoji={c.avatar}
                    className="h-8 w-8"
                    emojiClass="text-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500">
                      {c.author} · {c.time}
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-800">
                      {c.text}
                    </p>
                    <Actions c={c} />
                    {replyTo === c.id && replyInput(c.id)}

                    {/* 답글 토글 */}
                    {replies.length > 0 && (
                      <button
                        onClick={() => toggleExpand(c.id)}
                        className="mt-2 flex items-center gap-1 text-xs font-bold text-blue-600 active:scale-90"
                      >
                        <span>{open ? "▴" : "▾"}</span>
                        답글 {replies.length}개
                      </button>
                    )}

                    {/* 답글 목록 */}
                    {open &&
                      replies.map((r) => (
                        <div key={r.id} className="mt-3 flex gap-2">
                          <Avatar
                            url={r.avatarUrl}
                            emoji={r.avatar}
                            className="h-7 w-7"
                            emojiClass="text-xs"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-slate-500">
                              {r.author} · {r.time}
                            </p>
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
          })}
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
        <Avatar
          url={me.avatarUrl}
          emoji={me.avatar}
          className="h-8 w-8"
          emojiClass="text-sm"
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="댓글 추가…"
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
