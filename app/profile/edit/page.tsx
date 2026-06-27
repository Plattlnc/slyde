import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileEditForm from "@/components/profile-edit-form";

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile/edit");

  const { data: p } = await supabase
    .from("profiles")
    .select("name, tier, avatar, avatar_url, name_emoji, bio, badges")
    .eq("id", user.id)
    .single();

  return (
    <ProfileEditForm
      userId={user.id}
      tier={(p?.tier as string) ?? "개인회원"}
      initial={{
        name: (p?.name as string) ?? "",
        avatar: (p?.avatar as string) ?? "🛵",
        avatarUrl: (p?.avatar_url as string) ?? null,
        nameEmoji: (p?.name_emoji as string) ?? "",
        bio: (p?.bio as string) ?? "",
        badges: (p?.badges as string[]) ?? [],
      }}
    />
  );
}
