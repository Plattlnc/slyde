import Link from "next/link";
import { notFound } from "next/navigation";
import ThreadCard from "@/components/thread-card";
import CommentForm from "@/components/comment-form";
import { fetchPost, fetchComments } from "@/lib/posts";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await fetchPost(id);
  if (!post) notFound();

  const comments = await fetchComments(id);

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

      {/* 댓글 목록 */}
      <div className="flex-1">
        <p className="px-4 py-3 text-xs font-bold text-slate-500">
          댓글 {comments.length}
        </p>
        {comments.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-400">
            첫 댓글을 남겨보세요
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3 bg-white px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-base">
                  🛵
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="truncate font-semibold text-slate-900">
                      {c.author}
                    </span>
                    <span className="ml-auto shrink-0 text-xs text-slate-400">
                      {c.time}
                    </span>
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-800">
                    {c.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 댓글 입력 */}
      <CommentForm postId={id} />
    </div>
  );
}
