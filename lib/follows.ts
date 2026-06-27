import { createClient } from "@/lib/supabase/server";
import { relativeTime } from "@/lib/posts";
import type { FeedPost } from "@/lib/mock-data";

export type PublicProfile = {
  id: string;
  name: string;
  tier: string;
  company: string | null;
  avatar: string;
  avatarUrl: string | null;
  nameEmoji: string;
  bio: string | null;
  badges: string[];
  followerCount: number;
  followingCount: number;
  isMe: boolean;
  isFollowing: boolean;
};

export async function fetchPublicProfile(
  userId: string,
): Promise<PublicProfile | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, name, tier, company, avatar, avatar_url, name_emoji, bio, badges, follower_count, following_count",
      )
      .eq("id", userId)
      .single();
    if (error || !data) return null;

    let isFollowing = false;
    if (user && user.id !== userId) {
      const { data: f } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id)
        .eq("following_id", userId)
        .maybeSingle();
      isFollowing = !!f;
    }

    return {
      id: data.id as string,
      name: (data.name as string) ?? "라이더",
      tier: (data.tier as string) ?? "개인회원",
      company: (data.company as string) ?? null,
      avatar: (data.avatar as string) ?? "🛵",
      avatarUrl: (data.avatar_url as string) ?? null,
      nameEmoji: (data.name_emoji as string) ?? "",
      bio: (data.bio as string) ?? null,
      badges: (data.badges as string[]) ?? [],
      followerCount: (data.follower_count as number) ?? 0,
      followingCount: (data.following_count as number) ?? 0,
      isMe: user?.id === userId,
      isFollowing,
    };
  } catch {
    return null;
  }
}

export async function fetchUserPosts(userId: string): Promise<FeedPost[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("posts")
      .select(
        "id, author_id, author_name, author_tier, content, created_at, like_count, comment_count, share_count, image_urls",
      )
      .eq("author_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (!data) return [];

    return data.map((p) => ({
      id: p.id as string,
      real: true,
      authorId: p.author_id as string,
      mine: user ? p.author_id === user.id : false,
      author: (p.author_name as string) ?? "라이더",
      tier: ((p.author_tier as string) ?? "개인회원") as FeedPost["tier"],
      avatarEmoji: "🛵",
      time: relativeTime(p.created_at as string),
      text: (p.content as string) ?? "",
      images: (p.image_urls as string[]) ?? [],
      replies: (p.comment_count as number) ?? 0,
      reposts: 0,
      likes: (p.like_count as number) ?? 0,
      shares: (p.share_count as number) ?? 0,
    }));
  } catch {
    return [];
  }
}

export type FollowUser = {
  id: string;
  name: string;
  tier: string;
  isFollowing: boolean;
};

// type: 'followers' = userId를 팔로우하는 사람 / 'following' = userId가 팔로우하는 사람
export async function fetchFollowList(
  userId: string,
  type: "followers" | "following",
): Promise<FollowUser[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const col = type === "followers" ? "following_id" : "follower_id";
    const pick = type === "followers" ? "follower_id" : "following_id";

    const { data: rows } = await supabase
      .from("follows")
      .select(pick)
      .eq(col, userId)
      .limit(200);
    const ids = (rows ?? []).map((r) => r[pick as keyof typeof r] as string);
    if (!ids.length) return [];

    const { data: profs } = await supabase
      .from("profiles")
      .select("id, name, tier")
      .in("id", ids);

    // 내가 팔로우 중인지
    let myFollowing = new Set<string>();
    if (user) {
      const { data: mine } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id)
        .in("following_id", ids);
      myFollowing = new Set((mine ?? []).map((m) => m.following_id as string));
    }

    return (profs ?? []).map((p) => ({
      id: p.id as string,
      name: (p.name as string) ?? "라이더",
      tier: (p.tier as string) ?? "개인회원",
      isFollowing: myFollowing.has(p.id as string),
    }));
  } catch {
    return [];
  }
}
