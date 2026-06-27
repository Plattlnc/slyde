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
  content: string | null;
  created_at: string;
  like_count: number | null;
  comment_count: number | null;
  share_count: number | null;
  image_urls: string[] | null;
  video_url: string | null;
};

type AvatarInfo = { avatar: string; avatar_url: string | null };

function toFeedPost(
  p: PostRow,
  userId: string | null,
  likedSet: Set<string>,
  avatarMap?: Map<string, AvatarInfo>,
): FeedPost {
  const av = avatarMap?.get(p.author_id);
  return {
    id: p.id,
    real: true,
    authorId: p.author_id,
    mine: userId ? p.author_id === userId : false,
    author: p.author_name ?? "라이더",
    tier: (p.author_tier ?? "개인회원") as FeedPost["tier"],
    avatarEmoji: av?.avatar ?? "🛵",
    avatarUrl: av?.avatar_url ?? null,
    time: relativeTime(p.created_at),
    text: p.content ?? "",
    images: p.image_urls ?? [],
    videoUrl: p.video_url ?? null,
    replies: p.comment_count ?? 0,
    reposts: 0,
    likes: p.like_count ?? 0,
    shares: p.share_count ?? 0,
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
        "id, author_id, author_name, author_tier, content, created_at, like_count, comment_count, share_count, image_urls, video_url",
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

    // 작성자 현재 아바타
    const authorIds = [...new Set(rows.map((r) => r.author_id))];
    const avatarMap = new Map<string, AvatarInfo>();
    if (authorIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, avatar, avatar_url")
        .in("id", authorIds);
      (profs ?? []).forEach((pr) =>
        avatarMap.set(pr.id as string, {
          avatar: (pr.avatar as string) ?? "🛵",
          avatar_url: (pr.avatar_url as string) ?? null,
        }),
      );
    }

    return rows.map((p) => toFeedPost(p, user?.id ?? null, likedSet, avatarMap));
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
        "id, author_id, author_name, author_tier, content, created_at, like_count, comment_count, share_count, image_urls, video_url",
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
    const row = data as PostRow;
    const avatarMap = new Map<string, AvatarInfo>();
    const { data: pr } = await supabase
      .from("profiles")
      .select("avatar, avatar_url")
      .eq("id", row.author_id)
      .single();
    avatarMap.set(row.author_id, {
      avatar: (pr?.avatar as string) ?? "🛵",
      avatar_url: (pr?.avatar_url as string) ?? null,
    });
    return toFeedPost(row, user?.id ?? null, likedSet, avatarMap);
  } catch {
    return null;
  }
}

export type Comment = {
  id: string;
  author: string;
  avatar: string;
  avatarUrl: string | null;
  text: string;
  time: string;
  mine: boolean;
  parentId: string | null;
  likeCount: number;
  likedByMe: boolean;
};

export async function fetchComments(postId: string): Promise<Comment[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("post_comments")
      .select(
        "id, author_id, author_name, content, created_at, parent_id, like_count",
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error || !data) return [];

    // 작성자 현재 아바타
    const authorIds = [...new Set(data.map((c) => c.author_id as string))];
    const avatarMap = new Map<string, AvatarInfo>();
    if (authorIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, avatar, avatar_url")
        .in("id", authorIds);
      (profs ?? []).forEach((pr) =>
        avatarMap.set(pr.id as string, {
          avatar: (pr.avatar as string) ?? "🛵",
          avatar_url: (pr.avatar_url as string) ?? null,
        }),
      );
    }

    // 내가 좋아요한 댓글
    let likedSet = new Set<string>();
    if (user && data.length) {
      const { data: likes } = await supabase
        .from("comment_likes")
        .select("comment_id")
        .eq("user_id", user.id)
        .in(
          "comment_id",
          data.map((c) => c.id as string),
        );
      likedSet = new Set((likes ?? []).map((l) => l.comment_id as string));
    }

    return data.map((c) => {
      const av = avatarMap.get(c.author_id as string);
      return {
        id: c.id as string,
        author: (c.author_name as string) ?? "라이더",
        avatar: av?.avatar ?? "🛵",
        avatarUrl: av?.avatar_url ?? null,
        text: c.content as string,
        time: relativeTime(c.created_at as string),
        mine: user ? c.author_id === user.id : false,
        parentId: (c.parent_id as string) ?? null,
        likeCount: (c.like_count as number) ?? 0,
        likedByMe: likedSet.has(c.id as string),
      };
    });
  } catch {
    return [];
  }
}
