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
    <SubPage emoji="🚗" title={p.model}>
      <div
        className={`flex items-center gap-3 rounded-2xl bg-gradient-to-br ${p.gradient} p-5 text-white`}
      >
        <span className="text-5xl">{p.emoji}</span>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium">
              {p.sponsor}
            </span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium">
              {p.type} · {p.fuel}
            </span>
          </div>
          <p className="mt-1 text-lg font-bold">{p.model}</p>
        </div>
      </div>

      {/* 요약 */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          ["월 납입금", won(p.monthly)],
          ["보증금", won(p.deposit)],
          ["약정", `${p.termMonths}개월`],
        ].map(([label, val]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-3 text-center"
          >
            <p className="text-[11px] text-slate-400">{label}</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">{val}</p>
          </div>
        ))}
      </div>

      {/* 특징 */}
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="mb-2 text-xs font-bold text-slate-500">상품 특징</p>
        <ul className="space-y-1.5">
          {p.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-0.5 text-blue-500">✓</span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* 상담신청 */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <LeaseInquiryForm planId={p.id} planName={`${p.sponsor} ${p.model}`} />
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-400">
        * 데모 상품입니다. 상담 신청은 실제 저장되지만 연락은 가지 않아요.
      </p>
    </SubPage>
  );
}
