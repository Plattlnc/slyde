import { createClient } from "@/lib/supabase/server";
import type { FeedPost } from "@/lib/mock-data";

// ISO 시간 → 상대 표기 (방금/분/시간/일)
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}일`;
  return new Date(iso).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
}

type PostRow = {
  id: string;
  author_id: string;
  author_name: string | null;
  author_tier: string | null;
  content: string;
  created_at: string;
  like_count: number | null;
  comment_count: number | null;
};

function toFeedPost(
  p: PostRow,
  userId: string | null,
  likedSet: Set<string>,
): FeedPost {
  return {
    id: p.id,
    real: true,
    mine: userId ? p.author_id === userId : false,
    author: p.author_name ?? "라이더",
    tier: (p.author_tier ?? "개인회원") as FeedPost["tier"],
    avatarEmoji: "🛵",
    time: relativeTime(p.created_at),
    text: p.content,
    replies: p.comment_count ?? 0,
    reposts: 0,
    likes: p.like_count ?? 0,
    likedByMe: likedSet.has(p.id),
  };
}

// 피드 글 목록 (로그인 사용자만 조회됨, RLS)
export async function fetchFeedPosts(): Promise<FeedPost[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("posts")
      .select(
        "id, author_id, author_name, author_tier, content, created_at, like_count, comment_count",
      )
      .order("created_at", { ascending: false })
      .limit(50);
    if (error || !data) return [];

    const rows = data as PostRow[];
    let likedSet = new Set<string>();
    if (user && rows.length) {
      const { data: likes } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in(
          "post_id",
          rows.map((r) => r.id),
        );
      likedSet = new Set((likes ?? []).map((l) => l.post_id as string));
    }

    return rows.map((p) => toFeedPost(p, user?.id ?? null, likedSet));
  } catch {
    return [];
  }
}

// 단일 글
export async function fetchPost(id: string): Promise<FeedPost | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("posts")
      .select(
        "id, author_id, author_name, author_tier, content, created_at, like_count, comment_count",
      )
      .eq("id", id)
      .single();
    if (error || !data) return null;

    let liked = false;
    if (user) {
      const { data: l } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", user.id)
        .eq("post_id", id)
        .maybeSingle();
      liked = !!l;
    }
    const likedSet = liked ? new Set([id]) : new Set<string>();
    return toFeedPost(data as PostRow, user?.id ?? null, likedSet);
  } catch {
    return null;
  }
}

export type Comment = {
  id: string;
  author: string;
  tier: FeedPost["tier"];
  text: string;
  time: string;
  mine: boolean;
};

export async function fetchComments(postId: string): Promise<Comment[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("post_comments")
      .select("id, author_id, author_name, author_tier, content, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error || !data) return [];

    return data.map((c) => ({
      id: c.id as string,
      author: (c.author_name as string) ?? "라이더",
      tier: ((c.author_tier as string) ?? "개인회원") as FeedPost["tier"],
      text: c.content as string,
      time: relativeTime(c.created_at as string),
      mine: user ? c.author_id === user.id : false,
    }));
  } catch {
    return [];
  }
}
