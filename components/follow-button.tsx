"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function FollowButton({
  targetId,
  initialFollowing,
  size = "md",
}: {
  targetId: string;
  initialFollowing: boolean;
  size?: "sm" | "md";
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    const next = !following;
    setFollowing(next);
    setBusy(true);
    const supabase = createClient();
    const { error } = next
      ? await supabase.from("follows").insert({ following_id: targetId })
      : await supabase
          .from("follows")
          .delete()
          .eq("following_id", targetId);
    setBusy(false);
    if (error) setFollowing(!next); // 롤백
  }

  const pad = size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm";

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`rounded-full font-semibold transition active:scale-95 ${pad} ${
        following
          ? "border border-slate-300 bg-white text-slate-700"
          : "bg-slate-900 text-white"
      }`}
    >
      {following ? "팔로잉" : "팔로우"}
    </button>
  );
}
