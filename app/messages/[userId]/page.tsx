import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchThread, fetchPartner } from "@/lib/messages";
import ChatThread from "@/components/chat-thread";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/messages/${userId}`);
  if (userId === user.id) redirect("/messages");

  const partner = await fetchPartner(userId);
  if (!partner) notFound();

  const initial = await fetchThread(userId);

  return (
    <ChatThread
      otherId={userId}
      otherName={partner.name}
      otherAvatar={partner.avatar}
      otherAvatarUrl={partner.avatarUrl}
      myId={user.id}
      initial={initial}
    />
  );
}
