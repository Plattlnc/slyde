import Link from "next/link";
import UserList from "@/components/user-list";
import { fetchFollowList } from "@/lib/follows";
import { getMyId } from "@/lib/messages";

export default async function FollowingPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const [users, myId] = await Promise.all([
    fetchFollowList(userId, "following"),
    getMyId(),
  ]);

  return (
    <div className="min-h-full bg-slate-50">
      <header className="pt-safe sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
        <div className="flex h-12 items-center gap-2 px-4">
          <Link
            href={`/u/${userId}`}
            aria-label="뒤로"
            className="text-xl active:scale-90"
          >
            ←
          </Link>
          <span className="text-base font-extrabold text-slate-900">팔로잉</span>
        </div>
      </header>
      <UserList users={users} myId={myId} empty="아직 팔로우한 사람이 없어요" />
    </div>
  );
}
