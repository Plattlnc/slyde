import { hotPosts } from "@/lib/mock-data";

const boardColor: Record<string, string> = {
  "사건/사고": "bg-rose-100 text-rose-700",
  "질문/답변": "bg-amber-100 text-amber-700",
  "일상/유머": "bg-sky-100 text-sky-700",
};

export default function CommunityPreview() {
  return (
    <section className="px-4 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800">🔥 인기 커뮤니티</h2>
        <a href="/community" className="text-xs font-medium text-slate-900">
          더보기 →
        </a>
      </div>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
        {hotPosts.map((post) => (
          <a
            key={post.id}
            href={`/community/${post.id}`}
            className="block px-4 py-3 transition active:bg-slate-50"
          >
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  boardColor[post.board] ?? "bg-slate-100 text-slate-600"
                }`}
              >
                {post.board}
              </span>
              <span className="text-[11px] text-slate-400">{post.author}</span>
            </div>
            <p className="mt-1.5 line-clamp-1 text-sm font-medium text-slate-800">
              {post.title}
            </p>
            <div className="mt-1 flex gap-3 text-[11px] text-slate-400">
              <span>❤️ {post.likes}</span>
              <span>💬 {post.comments}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
