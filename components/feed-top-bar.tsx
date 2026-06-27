import Link from "next/link";
import MenuDrawer from "@/components/menu-drawer";
import type { CurrentProfile } from "@/lib/profile";

export default function FeedTopBar({
  profile,
}: {
  profile?: CurrentProfile | null;
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
          <button
            aria-label="알림"
            className="relative text-slate-500 active:scale-90"
          >
            <span className="text-xl">🔔</span>
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
