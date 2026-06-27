"use client";

import { useState } from "react";
import type { FeedPost } from "@/lib/mock-data";

const tierBadge: Record<FeedPost["tier"], string> = {
  기업회원: "bg-indigo-100 text-indigo-700",
  협력사회원: "bg-blue-100 text-blue-700",
  개인회원: "bg-slate-100 text-slate-600",
};

function formatCount(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1) + "천" : String(n);
}

export default function ThreadCard({ post }: { post: FeedPost }) {
  const [liked, setLiked] = useState(!!post.liked);
  const [likes, setLikes] = useState(post.likes);

  const toggleLike = () => {
    setLiked((prev) => {
      setLikes((c) => c + (prev ? -1 : 1));
      return !prev;
    });
  };

  return (
    <article className="flex gap-3 border-b border-slate-200 bg-white px-4 py-3">
      {/* 아바타 */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl">
        {post.avatarEmoji}
      </div>

      {/* 본문 영역 */}
      <div className="min-w-0 flex-1">
        {/* 헤더 줄 */}
        <div className="flex items-center gap-1.5 text-sm">
          <span className="truncate font-semibold text-slate-900">
            {post.author}
          </span>
          {post.verified && <span className="text-blue-500">✔️</span>}
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${tierBadge[post.tier]}`}
          >
            {post.tier}
          </span>
          {post.sponsored ? (
            <span className="ml-auto shrink-0 text-[11px] font-medium text-slate-400">
              광고
            </span>
          ) : (
            <span className="ml-auto shrink-0 text-xs text-slate-400">
              {post.time}
            </span>
          )}
        </div>
        {post.company && !post.sponsored && (
          <p className="text-[11px] text-slate-400">{post.company}</p>
        )}

        {/* 본문 */}
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
          {post.text}
        </p>

        {/* 이미지 자리 (데모) */}
        {post.image && (
          <div
            className={`mt-2.5 flex aspect-[16/9] items-center justify-center rounded-2xl bg-gradient-to-br ${post.image.gradient} text-5xl`}
          >
            {post.image.emoji}
          </div>
        )}

        {/* 스폰서 CTA */}
        {post.sponsored && (
          <a
            href="#"
            className="mt-2.5 flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 active:bg-slate-50"
          >
            <span className="text-xs text-slate-500">
              {post.sponsored.sponsor}
            </span>
            <span className="text-xs font-semibold text-blue-600">
              {post.sponsored.cta} →
            </span>
          </a>
        )}

        {/* 액션 바 */}
        <div className="mt-2 flex items-center gap-5 text-slate-500">
          <button
            onClick={toggleLike}
            aria-pressed={liked}
            aria-label="좋아요"
            className="flex items-center gap-1 text-sm active:scale-90"
          >
            <span className="text-base">{liked ? "❤️" : "🤍"}</span>
            <span className={liked ? "text-rose-500" : ""}>
              {formatCount(likes)}
            </span>
          </button>
          <button
            aria-label="답글"
            className="flex items-center gap-1 text-sm active:scale-90"
          >
            <span className="text-base">💬</span>
            <span>{formatCount(post.replies)}</span>
          </button>
          <button
            aria-label="리포스트"
            className="flex items-center gap-1 text-sm active:scale-90"
          >
            <span className="text-base">🔁</span>
            <span>{formatCount(post.reposts)}</span>
          </button>
          <button
            aria-label="공유"
            className="ml-auto text-base active:scale-90"
          >
            📤
          </button>
        </div>
      </div>
    </article>
  );
}
