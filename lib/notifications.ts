import { createClient } from "@/lib/supabase/server";
import { relativeTime } from "@/lib/posts";

export type Noti = {
  id: string;
  type: "follow" | "like" | "comment";
  actorId: string;
  actorName: string;
  actorTier: string;
  actorAvatar: string;
  actorAvatarUrl: string | null;
  postId: string | null;
  read: boolean;
  time: string;
  iFollowActor: boolean; // follow 알림에서 맞팔 여부
};

export async function fetchNotifications(): Promise<Noti[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from("notifications")
      .select("id, actor_id, type, post_id, read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (!data) return [];

    const actorIds = [...new Set(data.map((n) => n.actor_id as string))];
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, name, tier, avatar, avatar_url")
      .in("id", actorIds);
    const pMap = new Map((profs ?? []).map((p) => [p.id, p]));

    // 내가 이미 팔로우 중인 actor (맞팔 버튼 판단)
    const { data: myFollows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id)
      .in("following_id", actorIds.length ? actorIds : ["none"]);
    const followingSet = new Set(
      (myFollows ?? []).map((f) => f.following_id as string),
    );

    return data.map((n) => {
      const p = pMap.get(n.actor_id as string);
      return {
        id: n.id as string,
        type: n.type as Noti["type"],
        actorId: n.actor_id as string,
        actorName: (p?.name as string) ?? "라이더",
        actorTier: (p?.tier as string) ?? "개인회원",
        actorAvatar: (p?.avatar as string) ?? "🛵",
        actorAvatarUrl: (p?.avatar_url as string) ?? null,
        postId: (n.post_id as string) ?? null,
        read: n.read as boolean,
        time: relativeTime(n.created_at as string),
        iFollowActor: followingSet.has(n.actor_id as string),
      };
    });
  } catch {
    return [];
  }
}

export async function unreadCount(): Promise<number> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false);
    return count ?? 0;
  } catch {
    return 0;
  }
}
