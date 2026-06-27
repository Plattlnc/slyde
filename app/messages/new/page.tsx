import Link from "next/link";
import { redirect } from "next/navigation";
import Avatar from "@/components/avatar";
import { fetchUsers } from "@/lib/messages";
import { createClient } from "@/lib/supabase/server";

export default async function NewMessagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/messages/new");

  const users = await fetchUsers();

  return (
    <div className="min-h-full bg-slate-50">
      <header className="pt-safe sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
        <div className="flex h-12 items-center gap-2 px-4">
          <Link
            href="/messages"
            aria-label="뒤로"
            className="text-xl active:scale-90"
          >
            ←
          </Link>
          <span className="text-base font-extrabold text-slate-900">
            새 메시지
          </span>
        </div>
      </header>

      {users.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-slate-400">
          아직 다른 회원이 없어요. (다른 계정으로 가입해 테스트해보세요)
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {users.map((u) => (
            <Link
              key={u.id}
              href={`/messages/${u.id}`}
              className="flex items-center gap-3 bg-white px-4 py-3 active:bg-slate-50"
            >
              <Avatar
                url={u.avatarUrl}
                emoji={u.avatar}
                className="h-11 w-11"
                emojiClass="text-xl"
              />
              <span className="text-sm font-semibold text-slate-900">
                {u.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
