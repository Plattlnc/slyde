import Link from "next/link";
import { notFound } from "next/navigation";
import ThreadCard from "@/components/thread-card";
import FollowButton from "@/components/follow-button";
import Avatar from "@/components/avatar";
import { BADGE_CATALOG, type BadgeKey } from "@/lib/profile-options";
import { fetchPublicProfile, fetchUserPosts } from "@/lib/follows";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const profile = await fetchPublicProfile(userId);
  if (!profile) notFound();
  const posts = await fetchUserPosts(userId);

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

      {/* 작성한 글 */}
      <p className="px-4 pb-1 pt-4 text-xs font-bold text-slate-500">게시글</p>
      {posts.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-400">
          아직 작성한 글이 없어요
        </p>
      ) : (
        <div>
          {posts.map((p) => (
            <ThreadCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
