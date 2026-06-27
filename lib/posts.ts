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

// Supabase posts → FeedPost[] (로그인 사용자만 조회됨, RLS)
export async function fetchFeedPosts(): Promise<FeedPost[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select("id, author_name, author_tier, content, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error || !data) return [];
    return data.map((p) => ({
      id: p.id as string,
      author: (p.author_name as string) ?? "라이더",
      tier: ((p.author_tier as string) ?? "개인회원") as FeedPost["tier"],
      avatarEmoji: "🛵",
      time: relativeTime(p.created_at as string),
      text: p.content as string,
      replies: 0,
      reposts: 0,
      likes: 0,
    }));
  } catch {
    return [];
  }
}
