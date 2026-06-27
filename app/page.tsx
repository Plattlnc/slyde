import FeedTopBar from "@/components/feed-top-bar";
import StoriesBar from "@/components/stories-bar";
import InlineComposer from "@/components/inline-composer";
import ThreadCard from "@/components/thread-card";
import { feedPosts } from "@/lib/mock-data";
import { fetchFeedPosts } from "@/lib/posts";
import { getCurrentProfile } from "@/lib/profile";

export default async function Home() {
  // 실제 DB 글(로그인 시) + 샘플 mock 글을 함께 표시
  const [realPosts, profile] = await Promise.all([
    fetchFeedPosts(),
    getCurrentProfile(),
  ]);
  const posts = [...realPosts, ...feedPosts];

  return (
    <div className="flex min-h-full flex-col bg-slate-100">
      <FeedTopBar profile={profile} />
      <StoriesBar profile={profile} />
      <InlineComposer profile={profile} />
      <div className="flex flex-col">
        {posts.map((post) => (
          <ThreadCard key={post.id} post={post} />
        ))}
      </div>
      <p className="py-8 text-center text-xs text-slate-400">
        — 피드의 끝이에요 —
      </p>
    </div>
  );
}
