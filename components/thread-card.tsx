"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import PostImages from "@/components/post-images";
import Avatar from "@/components/avatar";
import {
  HeartIcon,
  CommentIcon,
  RepostIcon,
  ShareIcon,
} from "@/components/icons";
import type { FeedPost } from "@/lib/mock-data";

function formatCount(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1) + "천" : String(n);
}

export default function ThreadCard({ post }: { post: FeedPost }) {
  const router = useRouter();
  const [liked, setLiked] = useState(!!(post.likedByMe ?? post.liked));
  const [likes, setLikes] = useState(post.likes);
  const [shares, setShares] = useState(post.shares ?? 0);
  const [busy, setBusy] = useState(false);
  const [deleted, setDeleted] = useState(false);

  if (deleted) return null;

  async function toggleLike() {
    const next = !liked;
    // 낙관적 업데이트
    setLiked(next);
    setLikes((c) => c + (next ? 1 : -1));

    if (!post.real) return; // mock 글은 로컬 토글만

    const supabase = createClient();
    const { error } = next
      ? await supabase.from("post_likes").insert({ post_id: post.id })
      : await supabase.from("post_likes").delete().eq("post_id", post.id);

    if (error) {
      // 실패 시 롤백
      setLiked(!next);
      setLikes((c) => c + (next ? -1 : 1));
    }
  }

  async function handleDelete() {
    if (busy) return;
    if (!confirm("이 글을 삭제할까요?")) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    setBusy(false);
    if (!error) {
      setDeleted(true);
      router.refresh();
    } else {
      alert("삭제 실패: " + error.message);
    }
  }

  async function handleShare() {
    const url = post.real
      ? `${window.location.origin}/post/${post.id}`
      : window.location.origin;
    const data = { title: "slyde", text: post.text, url };
    let shared = false;
    if (navigator.share) {
      try {
        await navigator.share(data);
        shared = true;
      } catch {
        /* 사용자가 취소 */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("링크가 복사됐어요");
        shared = true;
      } catch {
        /* noop */
      }
    }
    if (!shared) return;
    setShares((c) => c + 1); // 낙관적
    if (post.real) {
      const supabase = createClient();
      await supabase.rpc("increment_share", { p_id: post.id });
    }
  }

  return (
    <article className="flex gap-3 border-b border-slate-200 bg-white px-4 py-3">
      {/* 아바타 */}
      <Avatar
        url={post.avatarUrl}
        emoji={post.avatarEmoji}
        className="h-10 w-10"
        emojiClass="text-xl"
      />

      {/* 본문 영역 */}
      <div className="min-w-0 flex-1">
        {/* 헤더 줄 */}
        <div className="flex items-center gap-1.5 text-sm">
          {post.real && post.authorId ? (
            <Link
              href={`/u/${post.authorId}`}
              className="truncate font-semibold text-slate-900 active:opacity-70"
            >
              {post.author}
            </Link>
          ) : (
            <span className="truncate font-semibold text-slate-900">
              {post.author}
            </span>
          )}
          {post.verified && <span className="text-blue-500">✔️</span>}
          {post.sponsored ? (
            <span className="ml-auto shrink-0 text-[11px] font-medium text-slate-400">
              광고
            </span>
          ) : (
            <span className="ml-auto shrink-0 text-xs text-slate-400">
              {post.time}
            </span>
          )}
          {post.mine && (
            <button
              onClick={handleDelete}
              disabled={busy}
              aria-label="삭제"
              className="ml-1 shrink-0 px-1 text-slate-400 active:scale-90"
            >
              🗑️
            </button>
          )}
        </div>
        {post.company && !post.sponsored && (
          <p className="text-[11px] text-slate-400">{post.company}</p>
        )}

        {/* 본문 (실글이면 상세로) */}
        {post.text &&
          (post.real ? (
            <Link href={`/post/${post.id}`} className="block">
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                {post.text}
              </p>
            </Link>
          ) : (
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
              {post.text}
            </p>
          ))}

        {/* 첨부 동영상 */}
        {post.videoUrl && (
          <video
            src={`${post.videoUrl}#t=0.1`}
            controls
            playsInline
            preload="metadata"
            className="mt-2.5 max-h-96 w-full rounded-2xl bg-black"
          />
        )}

        {/* 첨부 사진/gif */}
        {!post.videoUrl && <PostImages images={post.images} />}

        {/* 이미지 자리 (mock 데모) */}
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
        <div className="mt-2 flex items-center gap-6 text-slate-500">
          <button
            onClick={toggleLike}
            aria-pressed={liked}
            aria-label="좋아요"
            className={`flex items-center gap-1.5 text-xs active:scale-90 ${
              liked ? "text-rose-500" : ""
            }`}
          >
            <HeartIcon size={20} filled={liked} />
            {likes > 0 && <span>{formatCount(likes)}</span>}
          </button>

          {post.real ? (
            <Link
              href={`/post/${post.id}`}
              aria-label="댓글"
              className="flex items-center gap-1.5 text-xs active:scale-90"
            >
              <CommentIcon size={20} />
              {post.replies > 0 && <span>{formatCount(post.replies)}</span>}
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 text-xs">
              <CommentIcon size={20} />
              {post.replies > 0 && <span>{formatCount(post.replies)}</span>}
            </span>
          )}

          <span className="flex items-center gap-1.5 text-xs">
            <RepostIcon size={20} />
            {post.reposts > 0 && <span>{formatCount(post.reposts)}</span>}
          </span>
          <button
            onClick={handleShare}
            aria-label="공유"
            className="ml-auto flex items-center gap-1.5 text-xs active:scale-90"
          >
            <ShareIcon size={19} />
            {shares > 0 && <span>{formatCount(shares)}</span>}
          </button>
        </div>
      </div>
    </article>
  );
}
