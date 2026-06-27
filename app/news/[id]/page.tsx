import { notFound } from "next/navigation";
import SubPage from "@/components/sub-page";
import { getArticle, categoryColor } from "@/lib/news-data";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = getArticle(id);
  if (!article) notFound();

  return (
    <SubPage emoji="📰" title="배달뉴스">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${categoryColor[article.category]}`}
        >
          {article.category}
        </span>
        <span className="text-xs text-slate-400">
          {article.source} · {article.date}
        </span>
      </div>
      <h1 className="text-lg font-extrabold leading-snug text-slate-900">
        {article.title}
      </h1>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
        {article.body}
      </p>
      <p className="mt-6 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
        * 본 기사는 데모용 샘플 콘텐츠입니다.
      </p>
    </SubPage>
  );
}
