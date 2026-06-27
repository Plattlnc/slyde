import Link from "next/link";
import FollowButton from "@/components/follow-button";
import type { FollowUser } from "@/lib/follows";

export default function UserList({
  users,
  myId,
  empty,
}: {
  users: FollowUser[];
  myId: string | null;
  empty: string;
}) {
  if (users.length === 0) {
    return <p className="px-4 py-10 text-center text-sm text-slate-400">{empty}</p>;
  }
  return (
    <div className="divide-y divide-slate-100">
      {users.map((u) => (
        <div key={u.id} className="flex items-center gap-3 bg-white px-4 py-3">
          <Link
            href={`/u/${u.id}`}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl">
              🛵
            </div>
            <span className="truncate text-sm font-semibold text-slate-900">
              {u.name}
            </span>
          </Link>
          {myId && u.id !== myId && (
            <FollowButton
              targetId={u.id}
              initialFollowing={u.isFollowing}
              size="sm"
            />
          )}
        </div>
      ))}
    </div>
  );
}
