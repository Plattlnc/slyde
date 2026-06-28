import { notFound } from "next/navigation";
import SubPage from "@/components/sub-page";
import LeaseInquiryForm from "@/components/lease-inquiry-form";
import { getPlan, won } from "@/lib/lease-data";

export default async function LeaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = getPlan(id);
  if (!p) notFound();

  return (
    <SubPage emoji="🚗" title={p.name}>
      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
          {p.emoji}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-slate-900">{p.name}</span>
            {p.best && (
              <span className="rounded-full bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white">
                BEST
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">{p.sub}</p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 text-center">
        <p className="text-[11px] text-slate-400">월/일 납입금</p>
        <p className="mt-0.5 text-2xl font-extrabold text-slate-900">
          {won(p.price)}
          <span className="text-sm font-semibold text-slate-500"> / {p.unit}~</span>
        </p>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="mb-2 text-xs font-bold text-slate-500">상품 특징</p>
        <ul className="space-y-1.5">
          {p.tags.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-0.5 text-slate-500">✓</span>
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600">
          {p.desc}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <LeaseInquiryForm planId={p.id} planName={p.name} />
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-400">
        * 데모 상품입니다. 상담 신청은 실제 저장되지만 연락은 가지 않아요.
      </p>
    </SubPage>
  );
}
