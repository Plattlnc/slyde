"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ShortCommentSheet from "@/components/short-comment-sheet";
import type { Short } from "@/lib/shorts";

type Me = { name: string; avatar: string; avatarUrl: string | null };

function formatCount(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1) + "천" : String(n);
}

function ShortItem({
  short,
  muted,
  onToggleMute,
  me,
}: {
  short: Short;
  muted: boolean;
  onToggleMute: () => void;
  me: Me;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = useState(short.likedByMe);
  const [likes, setLikes] = useState(short.likes);
  const [comments, setComments] = useState(short.commentCount);
  const [showComments, setShowComments] = useState(false);
  const [deleted, setDeleted] = useState(false);

  // 화면에 보이면 재생, 벗어나면 정지
  useEffect(() => {
    if (short.mediaType !== "video") return;
    const el = wrapRef.current;
    const v = videoRef.current;
    if (!el || !v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: [0, 0.6, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [short.mediaType]);

  async function toggleLike() {
    const next = !liked;
    setLiked(next);
    setLikes((c) => c + (next ? 1 : -1));
    const supabase = createClient();
    const { error } = next
      ? await supabase.from("short_likes").insert({ short_id: short.id })
      : await supabase.from("short_likes").delete().eq("short_id", short.id);
    if (error) {
      setLiked(!next);
      setLikes((c) => c + (next ? -1 : 1));
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/shorts`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "slyde 숏폼", url });
      } catch {
        /* 취소 */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("링크가 복사됐어요");
      } catch {
        /* noop */
      }
    }
  }

  async function handleDelete() {
    if (!confirm("이 숏폼을 삭제할까요?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("shorts").delete().eq("id", short.id);
    if (!error) {
      setDeleted(true);
      router.refresh();
    }
  }

  if (deleted) return null;

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full shrink-0 snap-start snap-always bg-black"
      style={{ scrollSnapStop: "always" }}
    >
      {/* 미디어 */}
      {short.mediaType === "video" ? (
        <video
          ref={videoRef}
          src={short.mediaUrl}
          className="h-full w-full object-contain"
          loop
          muted={muted}
          playsInline
          onClick={(e) => {
            const v = e.currentTarget;
            if (v.paused) v.play().catch(() => {});
            else v.pause();
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={short.mediaUrl}
          alt={short.caption ?? "숏폼"}
          className="h-full w-full object-contain"
        />
      )}

      {/* 소리 켜기/끄기 (영상만) */}
      {short.mediaType === "video" && (
        <button
          onClick={onToggleMute}
          aria-label={muted ? "소리 켜기" : "소리 끄기"}
          className="pt-safe absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-lg text-white active:scale-90"
        >
          {muted ? "🔇" : "🔊"}
        </button>
      )}

      {/* 하단 그라데이션 + 작성자/캡션 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pb-6 text-white">
        <p className="text-sm font-bold">@{short.author}</p>
        <p className="text-[11px] text-white/70">
          {short.tier} · {short.time}
        </p>
        {short.caption && (
          <p className="mt-1.5 line-clamp-2 text-sm">{short.caption}</p>
        )}
      </div>

      {/* 우측 액션 */}
      <div className="absolute bottom-24 right-3 flex flex-col items-center gap-5 text-white">
        <button
          onClick={toggleLike}
          aria-label="좋아요"
          className="flex flex-col items-center active:scale-90"
        >
          <span className="text-3xl drop-shadow">{liked ? "❤️" : "🤍"}</span>
          <span className="text-xs font-semibold drop-shadow">
            {formatCount(likes)}
          </span>
        </button>
        <button
          onClick={() => setShowComments(true)}
          aria-label="댓글"
          className="flex flex-col items-center active:scale-90"
        >
          <span className="text-3xl drop-shadow">💬</span>
          <span className="text-xs font-semibold drop-shadow">
            {formatCount(comments)}
          </span>
        </button>
        <button
          onClick={handleShare}
          aria-label="공유"
          className="flex flex-col items-center active:scale-90"
        >
          <span className="text-3xl drop-shadow">📤</span>
          <span className="text-xs font-semibold drop-shadow">공유</span>
        </button>
        {short.mine && (
          <button
            onClick={handleDelete}
            aria-label="삭제"
            className="flex flex-col items-center active:scale-90"
          >
            <span className="text-2xl drop-shadow">🗑️</span>
          </button>
        )}
      </div>

      {/* 댓글 시트 */}
      <ShortCommentSheet
        shortId={short.id}
        open={showComments}
        onClose={() => setShowComments(false)}
        me={me}
        onAdded={() => setComments((c) => c + 1)}
      />
    </div>
  );
}

export default function ShortsFeed({
  shorts,
  me,
}: {
  shorts: Short[];
  me: Me;
}) {
  // 자동재생 위해 기본 음소거, 사용자가 🔊 누르면 소리 켜짐 (전체 적용)
  const [muted, setMuted] = useState(true);

  return (
    <div className="no-scrollbar h-full snap-y snap-mandatory overflow-y-scroll overscroll-contain bg-black">
      {shorts.map((s) => (
        <ShortItem
          key={s.id}
          short={s}
          muted={muted}
          onToggleMute={() => setMuted((m) => !m)}
          me={me}
        />
      ))}
    </div>
  );
}
