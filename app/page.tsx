import FeedTopBar from "@/components/feed-top-bar";
import InlineComposer from "@/components/inline-composer";
import ThreadCard from "@/components/thread-card";
import FeedRefresher from "@/components/feed-refresher";
import { fetchFeedPosts } from "@/lib/posts";
import { getCurrentProfile } from "@/lib/profile";
import { unreadCount } from "@/lib/notifications";

export default async function Home() {
  const [posts, profile, unread] = await Promise.all([
    fetchFeedPosts(),
    getCurrentProfile(),
    unreadCount(),
  ]);

  return (
    <div className="flex min-h-full flex-col bg-slate-100">
      <FeedTopBar profile={profile} unread={unread} />
      <FeedRefresher />
      <InlineComposer profile={profile} />
      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <div className="text-4xl">🛵</div>
          <p className="text-sm text-slate-400">
            아직 글이 없어요. 첫 글을 남겨보세요!
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            {posts.map((post) => (
              <ThreadCard key={post.id} post={post} />
            ))}
          </div>
          <p className="py-8 text-center text-xs text-slate-400">
            — 피드의 끝이에요 —
          </p>
        </>
      )}
    </div>
  );
}
