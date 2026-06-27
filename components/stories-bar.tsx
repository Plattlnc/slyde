import { stories } from "@/lib/mock-data";
import type { CurrentProfile } from "@/lib/profile";

function StoryRing({
  emoji,
  viewed,
}: {
  emoji: string;
  viewed?: boolean;
}) {
  return (
    <div
      className={`rounded-full p-[2.5px] ${
        viewed
          ? "bg-slate-300"
          : "bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600"
      }`}
    >
      <div className="rounded-full bg-white p-[2px]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
          {emoji}
        </div>
      </div>
    </div>
  );
}

export default function StoriesBar({
  profile,
}: {
  profile?: CurrentProfile | null;
}) {
  const avatar = profile?.avatarEmoji ?? "🛵";
  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3">
      {/* 내 스토리 (추가 버튼) */}
      <button className="flex w-[72px] shrink-0 flex-col items-center gap-1 active:scale-95">
        <div className="relative">
          <div className="rounded-full p-[2.5px]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl ring-2 ring-slate-200">
              {avatar}
            </div>
          </div>
          <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-xs font-bold leading-none text-white">
            +
          </span>
        </div>
        <span className="w-full truncate text-center text-[11px] text-slate-500">
          내 스토리
        </span>
      </button>

      {/* 팔로우한 사람들 스토리 */}
      {stories.map((s) => (
        <button
          key={s.id}
          className="flex w-[72px] shrink-0 flex-col items-center gap-1 active:scale-95"
        >
          <StoryRing emoji={s.avatarEmoji} viewed={s.viewed} />
          <span
            className={`w-full truncate text-center text-[11px] ${
              s.viewed ? "text-slate-400" : "text-slate-700"
            }`}
          >
            {s.name}
          </span>
        </button>
      ))}
    </div>
  );
}
