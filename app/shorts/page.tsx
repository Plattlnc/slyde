import Link from "next/link";
import ShortsFeed from "@/components/shorts-feed";
import { fetchShorts } from "@/lib/shorts";
import { getCurrentProfile } from "@/lib/profile";

export default async function ShortsPage() {
  const [shorts, profile] = await Promise.all([
    fetchShorts(),
    getCurrentProfile(),
  ]);
  const me = {
    name: profile?.name ?? "라이더",
    avatar: profile?.avatarEmoji ?? "🛵",
    avatarUrl: profile?.avatarUrl ?? null,
  };

  if (shorts.length === 0) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
        <div className="text-5xl">🎬</div>
        <div>
          <h1 className="text-lg font-bold">아직 숏폼이 없어요</h1>
          <p className="mt-1 text-sm text-white/60">
            첫 숏폼을 올려보세요 (사진·영상)
          </p>
        </div>
        <Link
          href="/shorts/new"
          className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black active:scale-95"
        >
          ＋ 숏폼 올리기
        </Link>
      </div>
    );
  }

  return <ShortsFeed shorts={shorts} me={me} />;
}
