import type { CurrentProfile } from "@/lib/profile";

// 피드 최상단 작성 진입 영역 (Threads의 "무슨 일이 있나요?")
export default function ComposerPrompt({
  profile,
}: {
  profile?: CurrentProfile | null;
}) {
  const avatar = profile?.avatarEmoji ?? "🛵";
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl">
        {avatar}
      </div>
      <a href="/compose" className="flex-1 text-sm text-slate-400">
        무슨 일이 있나요?
      </a>
      <a
        href="/compose"
        className="shrink-0 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white active:scale-95"
      >
        게시
      </a>
    </div>
  );
}
