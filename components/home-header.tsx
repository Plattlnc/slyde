import { rider } from "@/lib/mock-data";

export default function HomeHeader() {
  return (
    <header className="pt-safe bg-gradient-to-b from-slate-800 to-slate-700 px-5 pb-6 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-2xl font-black tracking-tight">slyde</span>
          <span className="text-lg">🛵</span>
        </div>
        <button
          aria-label="알림"
          className="relative rounded-full bg-white/15 p-2 transition active:scale-95"
        >
          <span className="text-lg">🔔</span>
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-400" />
        </button>
      </div>

      {/* 라이더 프로필 요약 */}
      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-2xl">
          {rider.avatarEmoji}
        </div>
        <div>
          <p className="text-base font-semibold">{rider.name} 님</p>
          <p className="text-xs text-slate-300">
            {rider.tier}
            {rider.company ? ` · ${rider.company}` : ""}
          </p>
        </div>
      </div>
    </header>
  );
}
