import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchUserPosts } from "@/lib/follows";
import LogoutButton from "@/components/logout-button";
import Avatar from "@/components/avatar";
import { BADGE_CATALOG, type BadgeKey } from "@/lib/profile-options";

const tierBadge: Record<string, string> = {
  기업회원: "bg-indigo-100 text-indigo-700",
  협력사회원: "bg-blue-100 text-blue-700",
  개인회원: "bg-slate-100 text-slate-600",
};

const cellGradients = [
  "from-slate-300 to-slate-400",
  "from-indigo-300 to-indigo-500",
  "from-rose-300 to-rose-500",
  "from-emerald-300 to-emerald-500",
  "from-amber-300 to-amber-500",
  "from-violet-300 to-violet-500",
];

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-5xl">🛵</div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">로그인이 필요해요</h1>
          <p className="mt-1 text-sm text-slate-500">
            로그인하고 내 프로필과 실적을 확인하세요.
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Link
            href="/login"
            className="rounded-xl bg-blue-600 py-3 text-sm font-bold text-white active:scale-[0.98]"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 active:scale-[0.98]"
          >
            회원가입
          </Link>
        </div>
      </div>
    );
  }

  const [{ data: profile }, { count: postCount }, posts] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "name, tier, company, avatar, avatar_url, name_emoji, bio, badges, follower_count, following_count",
      )
      .eq("id", user.id)
      .single(),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", user.id),
    fetchUserPosts(user.id),
  ]);

  const name = profile?.name ?? "라이더";
  const tier = profile?.tier ?? "개인회원";
  const company = profile?.company;
  const handle = "@" + (user.email?.split("@")[0] ?? "rider");
  const avatarUrl = (profile?.avatar_url as string) ?? null;
  const avatarEmoji = (profile?.avatar as string) ?? "🛵";
  const nameEmoji = (profile?.name_emoji as string) ?? "";
  const bio = (profile?.bio as string) ?? "";
  const badges = ((profile?.badges as string[]) ?? []) as BadgeKey[];

  return (
    <div className="min-h-full bg-white">
      {/* 헤더: 아바타 + 이름 */}
      <div className="flex items-start gap-4 px-4 pb-4 pt-6">
        <Avatar
          url={avatarUrl}
          emoji={avatarEmoji}
          className="h-[74px] w-[74px]"
          emojiClass="text-4xl"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-extrabold text-slate-900">{name}</span>
            {nameEmoji && <span className="text-base">{nameEmoji}</span>}
          </div>
          <p className="mt-0.5 text-[13px] text-slate-500">
            {company ? `${company} · ` : ""}
            {handle}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tierBadge[tier]}`}
            >
              {tier}
            </span>
            {badges.map((k) =>
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
          {bio && (
            <p className="mt-2 text-[13px] leading-relaxed text-slate-700">
              {bio}
            </p>
          )}
        </div>
      </div>

      {/* 통계 */}
      <div className="flex border-y border-slate-100">
        <div className="flex-1 border-r border-slate-100 py-3.5 text-center">
          <div className="text-lg font-extrabold tabular-nums text-slate-900">
            {postCount ?? 0}
          </div>
          <div className="text-[11.5px] text-slate-500">게시글</div>
        </div>
        <Link
          href={`/u/${user.id}/followers`}
          className="flex-1 border-r border-slate-100 py-3.5 text-center active:bg-slate-50"
        >
          <div className="text-lg font-extrabold tabular-nums text-slate-900">
            {profile?.follower_count ?? 0}
          </div>
          <div className="text-[11.5px] text-slate-500">팔로워</div>
        </Link>
        <Link
          href={`/u/${user.id}/following`}
          className="flex-1 py-3.5 text-center active:bg-slate-50"
        >
          <div className="text-lg font-extrabold tabular-nums text-slate-900">
            {profile?.following_count ?? 0}
          </div>
          <div className="text-[11.5px] text-slate-500">팔로잉</div>
        </Link>
      </div>

      {/* 액션 */}
      <div className="flex gap-2 px-4 py-3.5">
        <Link
          href="/dashboard"
          className="flex-1 rounded-[10px] bg-blue-600 py-2.5 text-center text-sm font-bold text-white active:scale-[0.98]"
        >
          📊 내 실적 보기
        </Link>
        <Link
          href="/profile/edit"
          className="flex-1 rounded-[10px] border border-slate-200 bg-white py-2.5 text-center text-sm font-bold text-slate-700 active:scale-[0.98]"
        >
          ✏️ 프로필 편집
        </Link>
      </div>

      {/* 내 게시글 그리드 */}
      <div className="border-t-8 border-slate-50 px-4 pb-2 pt-3 text-[13px] font-bold text-slate-500">
        📷 내 게시글
      </div>
      {posts.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-slate-400">
          아직 작성한 글이 없어요
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-[3px]">
          {posts.map((p, i) => (
            <Link
              key={p.id}
              href={`/post/${p.id}`}
              className="relative aspect-square"
            >
              {p.images && p.images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.images[0]}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className={`flex h-full w-full items-center justify-center bg-gradient-to-br p-2 text-center text-[11px] font-medium text-white ${
                    cellGradients[i % cellGradients.length]
                  }`}
                >
                  <span className="line-clamp-3">{p.text || "🛵"}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* 로그아웃 */}
      <div className="px-4 py-5">
        <LogoutButton />
      </div>
    </div>
  );
}
