import Link from "next/link";
import { notFound } from "next/navigation";
import FollowButton from "@/components/follow-button";
import Avatar from "@/components/avatar";
import { BADGE_CATALOG, type BadgeKey } from "@/lib/profile-options";
import { fetchPublicProfile, fetchUserPosts } from "@/lib/follows";
import { fetchUserShorts } from "@/lib/shorts";

const cellGradients = [
  "from-slate-300 to-slate-400",
  "from-indigo-300 to-indigo-500",
  "from-rose-300 to-rose-500",
  "from-emerald-300 to-emerald-500",
  "from-amber-300 to-amber-500",
  "from-violet-300 to-violet-500",
];

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const profile = await fetchPublicProfile(userId);
  if (!profile) notFound();
  const [posts, shorts] = await Promise.all([
    fetchUserPosts(userId),
    fetchUserShorts(userId),
  ]);

  const cells = [
    ...posts.map((p) => ({
      key: p.id,
      href: `/post/${p.id}`,
      video: p.videoUrl ?? null,
      image: p.images?.[0] ?? null,
      text: p.text,
    })),
    ...shorts.map((s) => ({
      key: "s" + s.id,
      href: "/shorts",
      video: s.mediaType === "video" ? s.mediaUrl : null,
      image: s.mediaType === "image" ? s.mediaUrl : null,
      text: s.caption ?? "",
    })),
  ];

  return (
    <div className="min-h-full bg-slate-50">
      {/* 상단 바 */}
      <header className="pt-safe sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
        <div className="flex h-12 items-center gap-2 px-4">
          <Link href="/" aria-label="뒤로" className="text-xl active:scale-90">
            ←
          </Link>
          <span className="text-base font-extrabold text-slate-900">
            {profile.name}
          </span>
        </div>
      </header>

      {/* 프로필 헤더 */}
      <div className="bg-white px-5 py-5">
        <div className="flex items-start gap-4">
          <Avatar
            url={profile.avatarUrl}
            emoji={profile.avatar}
            className="h-16 w-16"
            emojiClass="text-3xl"
          />
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-slate-900">
                {profile.name}
              </span>
              {profile.nameEmoji && (
                <span className="text-base">{profile.nameEmoji}</span>
              )}
            </div>
            {profile.company && (
              <p className="text-xs text-slate-400">{profile.company}</p>
            )}
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {(profile.badges as BadgeKey[]).map((k) =>
                BADGE_CATALOG[k] ? (
                  <span
                    key={k}
                    className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700"
                  >
                    {BADGE_CATALOG[k].i} {BADGE_CATALOG[k].l}
                  </span>
                ) : null,
              )}
            </div>
            {profile.bio && (
              <p className="mt-2 text-[13px] leading-relaxed text-slate-700">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* 카운트 */}
        <div className="mt-4 flex gap-6">
          <Link href={`/u/${userId}/followers`} className="text-center">
            <span className="block text-base font-bold text-slate-900">
              {profile.followerCount}
            </span>
            <span className="text-xs text-slate-500">팔로워</span>
          </Link>
          <Link href={`/u/${userId}/following`} className="text-center">
            <span className="block text-base font-bold text-slate-900">
              {profile.followingCount}
            </span>
            <span className="text-xs text-slate-500">팔로잉</span>
          </Link>
        </div>

        {/* 액션 */}
        <div className="mt-4 flex gap-2">
          {profile.isMe ? (
            <Link
              href="/profile"
              className="flex-1 rounded-full border border-slate-300 bg-white py-2 text-center text-sm font-semibold text-slate-700 active:scale-[0.98]"
            >
              내 프로필
            </Link>
          ) : (
            <>
              <div className="flex-1">
                <FollowButton
                  targetId={userId}
                  initialFollowing={profile.isFollowing}
                />
              </div>
              <Link
                href={`/messages/${userId}`}
                className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 active:scale-95"
              >
                메시지
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 게시글 그리드 */}
      <p className="px-4 pb-2 pt-4 text-xs font-bold text-slate-500">📷 게시글</p>
      {cells.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-400">
          아직 작성한 글이 없어요
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-[3px]">
          {cells.map((c, i) => (
            <Link
              key={c.key}
              href={c.href}
              className="relative aspect-square overflow-hidden"
            >
              {c.video ? (
                <>
                  <video
                    src={`${c.video}#t=0.1`}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full bg-black object-cover"
                  />
                  <span className="absolute right-1.5 top-1.5 text-sm text-white drop-shadow">
                    ▶
                  </span>
                </>
              ) : c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div
                  className={`flex h-full w-full items-center justify-center bg-gradient-to-br p-2 text-center text-[11px] font-medium text-white ${
                    cellGradients[i % cellGradients.length]
                  }`}
                >
                  <span className="line-clamp-3">{c.text || "🛵"}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
