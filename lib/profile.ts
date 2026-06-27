import { createClient } from "@/lib/supabase/server";

export type Tier = "개인회원" | "협력사회원" | "기업회원";

export type CurrentProfile = {
  name: string;
  tier: Tier;
  company: string | null;
  avatarEmoji: string;
};

// 로그인한 사용자의 프로필 (없으면 null)
export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("name, tier, company")
      .eq("id", user.id)
      .single();

    return {
      name: (data?.name as string) ?? "라이더",
      tier: ((data?.tier as string) ?? "개인회원") as Tier,
      company: (data?.company as string) ?? null,
      avatarEmoji: "🛵",
    };
  } catch {
    return null;
  }
}
