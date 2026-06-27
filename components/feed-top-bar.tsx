import Link from "next/link";
import MenuDrawer from "@/components/menu-drawer";
import type { CurrentProfile } from "@/lib/profile";

export default function FeedTopBar({
  profile,
  unread = 0,
}: {
  profile?: CurrentProfile | null;
  unread?: number;
}) {
  return (
    <header className="pt-safe sticky top-0 z-20 border-b border-slate-200 bg-slate-50/80 backdrop-blur">
      <div className="flex h-12 items-center justify-between px-4">
        <MenuDrawer profile={profile} />
        <div className="flex items-center gap-1">
          <span className="text-lg font-black tracking-tight text-slate-900">
            slyde
          </span>
          <span className="text-base">🛵</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/search"
            aria-label="검색"
            className="text-slate-500 active:scale-90"
          >
            <span className="text-xl">🔍</span>
          </Link>
          <Link
            href="/notifications"
            aria-label="알림"
            className="relative text-slate-500 active:scale-90"
          >
            <span className="text-xl">🔔</span>
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
