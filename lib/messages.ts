import { createClient } from "@/lib/supabase/server";
import { relativeTime } from "@/lib/posts";

export type Conversation = {
  otherId: string;
  name: string;
  tier: string;
  avatar: string;
  avatarUrl: string | null;
  lastText: string;
  time: string;
  fromMe: boolean;
};

export type ChatMessage = {
  id: string;
  content: string;
  mine: boolean;
  createdAt: string;
};

export type UserLite = {
  id: string;
  name: string;
  tier: string;
  avatar: string;
  avatarUrl: string | null;
};

// 대화 목록 (상대별 최근 메시지)
export async function fetchConversations(): Promise<Conversation[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: msgs } = await supabase
      .from("messages")
      .select("sender_id, recipient_id, content, created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    if (!msgs) return [];

    const seen = new Map<
      string,
      Omit<Conversation, "name" | "tier" | "avatar" | "avatarUrl">
    >();
    for (const m of msgs) {
      const other =
        m.sender_id === user.id ? m.recipient_id : m.sender_id;
      if (!seen.has(other)) {
        seen.set(other, {
          otherId: other,
          lastText: m.content,
          time: relativeTime(m.created_at),
          fromMe: m.sender_id === user.id,
        });
      }
    }

    const ids = [...seen.keys()];
    if (!ids.length) return [];
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, name, tier, avatar, avatar_url")
      .in("id", ids);
    const nameMap = new Map((profs ?? []).map((p) => [p.id, p]));

    return [...seen.values()].map((c) => {
      const p = nameMap.get(c.otherId);
      return {
        ...c,
        name: (p?.name as string) ?? "라이더",
        tier: (p?.tier as string) ?? "개인회원",
        avatar: (p?.avatar as string) ?? "🛵",
        avatarUrl: (p?.avatar_url as string) ?? null,
      };
    });
  } catch {
    return [];
  }
}

// 대화목록 + 팔로잉 중 아직 대화 안 한 사람(추천)
export async function fetchMessageList(): Promise<{
  conversations: Conversation[];
  suggestions: UserLite[];
}> {
  const conversations = await fetchConversations();
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { conversations, suggestions: [] };

    const { data: fl } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);
    const followingIds = (fl ?? []).map((f) => f.following_id as string);
    const convoIds = new Set(conversations.map((c) => c.otherId));
    const newIds = followingIds.filter((id) => !convoIds.has(id));
    if (!newIds.length) return { conversations, suggestions: [] };

    const { data: profs } = await supabase
      .from("profiles")
      .select("id, name, tier, avatar, avatar_url")
      .in("id", newIds);
    const suggestions: UserLite[] = (profs ?? []).map((p) => ({
      id: p.id as string,
      name: (p.name as string) ?? "라이더",
      tier: (p.tier as string) ?? "개인회원",
      avatar: (p.avatar as string) ?? "🛵",
      avatarUrl: (p.avatar_url as string) ?? null,
    }));
    return { conversations, suggestions };
  } catch {
    return { conversations, suggestions: [] };
  }
}

// 특정 상대와의 대화 내용
export async function fetchThread(otherId: string): Promise<ChatMessage[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, content, created_at")
      .or(
        `and(sender_id.eq.${user.id},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${user.id})`,
      )
      .order("created_at", { ascending: true })
      .limit(500);

    return (data ?? []).map((m) => ({
      id: m.id as string,
      content: m.content as string,
      mine: m.sender_id === user.id,
      createdAt: m.created_at as string,
    }));
  } catch {
    return [];
  }
}

// 상대 프로필
export async function fetchPartner(otherId: string): Promise<UserLite | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, name, tier, avatar, avatar_url")
      .eq("id", otherId)
      .single();
    if (!data) return null;
    return {
      id: data.id as string,
      name: (data.name as string) ?? "라이더",
      tier: (data.tier as string) ?? "개인회원",
      avatar: (data.avatar as string) ?? "🛵",
      avatarUrl: (data.avatar_url as string) ?? null,
    };
  } catch {
    return null;
  }
}

// 메시지 보낼 유저 검색/목록 (본인 제외)
export async function fetchUsers(): Promise<UserLite[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from("profiles")
      .select("id, name, tier, avatar, avatar_url")
      .neq("id", user.id)
      .limit(100);
    return (data ?? []).map((p) => ({
      id: p.id as string,
      name: (p.name as string) ?? "라이더",
      tier: (p.tier as string) ?? "개인회원",
      avatar: (p.avatar as string) ?? "🛵",
      avatarUrl: (p.avatar_url as string) ?? null,
    }));
  } catch {
    return [];
  }
}

// 현재 로그인 유저 id (클라 전달용)
export async function getMyId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
