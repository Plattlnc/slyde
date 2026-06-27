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
      <div className="relative flex h-10 items-center px-4">
        <div className="z-10">
          <MenuDrawer profile={profile} />
        </div>
        {/* 로고: 뷰포트 정중앙 */}
        <span className="wordmark pointer-events-none absolute left-1/2 -translate-x-1/2 text-[24px] text-slate-900">
          slyde
        </span>
        <div className="z-10 ml-auto flex items-center gap-4 text-slate-700">
          <Link href="/search" aria-label="검색" className="active:scale-90">
            <SearchIcon size={21} />
          </Link>
          <Link
            href="/notifications"
            aria-label="알림"
            className="relative active:scale-90"
          >
            <BellIcon size={21} />
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
