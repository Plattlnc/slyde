import Link from "next/link";
import MenuDrawer from "@/components/menu-drawer";
import { SearchIcon, BellIcon } from "@/components/icons";
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
        <div className="flex items-center gap-4 text-slate-700">
          <Link href="/search" aria-label="검색" className="active:scale-90">
            <SearchIcon size={22} />
          </Link>
          <Link
            href="/notifications"
            aria-label="알림"
            className="relative active:scale-90"
          >
            <BellIcon size={22} />
            {unread > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
