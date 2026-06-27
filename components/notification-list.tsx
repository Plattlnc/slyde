"use client";

import { useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/avatar";
import FollowButton from "@/components/follow-button";
import type { Noti } from "@/lib/notifications";

const MSG: Record<Noti["type"], string> = {
  follow: "님이 회원님을 팔로우했어요",
  like: "님이 회원님의 글을 좋아합니다",
  comment: "님이 회원님의 글에 댓글을 남겼어요",
};

export default function NotificationList({ items }: { items: Noti[] }) {
  // 들어오면 전부 읽음 처리
  useEffect(() => {
    const supabase = createClient();
    supabase.from("notifications").update({ read: true }).eq("read", false);
  }, []);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
        <div className="text-5xl">🔔</div>
        <p className="text-sm text-slate-400">아직 알림이 없어요</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {items.map((n) => {
        const text = (
          <span className="text-sm text-slate-800">
            <b className="font-semibold">{n.actorName}</b>
            {MSG[n.type]}
            <span className="ml-1 text-[11px] text-slate-400">{n.time}</span>
          </span>
        );
        return (
          <div
            key={n.id}
            className={`flex items-center gap-3 px-4 py-3 ${
              n.read ? "bg-white" : "bg-blue-50/60"
            }`}
          >
            <Link href={`/u/${n.actorId}`} className="shrink-0">
              <Avatar
                url={n.actorAvatarUrl}
                emoji={n.actorAvatar}
                className="h-11 w-11"
                emojiClass="text-lg"
              />
            </Link>

            {n.type === "follow" ? (
              <div className="min-w-0 flex-1">{text}</div>
            ) : (
              <Link
                href={n.postId ? `/post/${n.postId}` : "#"}
                className="min-w-0 flex-1"
              >
                {text}
              </Link>
            )}

            {n.type === "follow" && (
              <FollowButton
                targetId={n.actorId}
                initialFollowing={n.iFollowActor}
                size="sm"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
