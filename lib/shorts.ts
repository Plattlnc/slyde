import { createClient } from "@/lib/supabase/server";
import { relativeTime } from "@/lib/posts";

export type Short = {
  id: string;
  author: string;
  tier: "개인회원" | "협력사회원" | "기업회원";
  mediaUrl: string;
  mediaType: "image" | "video";
  caption: string | null;
  time: string;
  likes: number;
  likedByMe: boolean;
  commentCount: number;
  mine: boolean;
};

export type UserShort = {
  id: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption: string | null;
};

// 특정 유저의 숏폼 (프로필 그리드용)
export async function fetchUserShorts(userId: string): Promise<UserShort[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("shorts")
      .select("id, media_url, media_type, caption")
      .eq("author_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    return (data ?? []).map((s) => ({
      id: s.id as string,
      mediaUrl: s.media_url as string,
      mediaType: s.media_type as "image" | "video",
      caption: (s.caption as string) ?? null,
    }));
  } catch {
    return [];
  }
}

export async function fetchShorts(): Promise<Short[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("shorts")
      .select(
        "id, author_id, author_name, author_tier, media_url, media_type, caption, like_count, comment_count, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(50);
    if (error || !data) return [];

    let likedSet = new Set<string>();
    if (user && data.length) {
      const { data: likes } = await supabase
        .from("short_likes")
        .select("short_id")
        .eq("user_id", user.id)
        .in(
          "short_id",
          data.map((r) => r.id as string),
        );
      likedSet = new Set((likes ?? []).map((l) => l.short_id as string));
    }

    return data.map((s) => ({
      id: s.id as string,
      author: (s.author_name as string) ?? "라이더",
      tier: ((s.author_tier as string) ?? "개인회원") as Short["tier"],
      mediaUrl: s.media_url as string,
      mediaType: s.media_type as "image" | "video",
      caption: (s.caption as string) ?? null,
      time: relativeTime(s.created_at as string),
      likes: (s.like_count as number) ?? 0,
      likedByMe: likedSet.has(s.id as string),
      commentCount: (s.comment_count as number) ?? 0,
      mine: user ? s.author_id === user.id : false,
    }));
  } catch {
    return [];
  }
}
