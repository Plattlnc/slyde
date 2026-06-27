import Link from "next/link";
import { notFound } from "next/navigation";
import ThreadCard from "@/components/thread-card";
import CommentSection from "@/components/comment-section";
import { fetchPost, fetchComments } from "@/lib/posts";
import { getCurrentProfile } from "@/lib/profile";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await fetchPost(id);
  if (!post) notFound();

  const [comments, profile] = await Promise.all([
    fetchComments(id),
    getCurrentProfile(),
  ]);

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      {/* 상단 바 */}
      <header className="pt-safe sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
        <div className="flex h-12 items-center gap-2 px-4">
          <Link href="/" aria-label="뒤로" className="text-xl active:scale-90">
            ←
          </Link>
          <span className="text-base font-extrabold text-slate-900">게시글</span>
        </div>
      </header>

      {/* 원글 */}
      <ThreadCard post={post} />

      {/* 댓글 (답글·좋아요) */}
      <div className="flex flex-1 flex-col">
        <CommentSection
          postId={id}
          initial={comments}
          me={{
            name: profile?.name ?? "라이더",
            avatar: profile?.avatarEmoji ?? "🛵",
            avatarUrl: profile?.avatarUrl ?? null,
          }}
        />
      </div>
    </div>
  );
}
