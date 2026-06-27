import Link from "next/link";
import SubPage from "@/components/sub-page";
import { leasePlans, won } from "@/lib/lease-data";

export default function LeasePage() {
  return (
    <SubPage emoji="🚗" title="리스/렌탈">
      <p className="mb-3 text-sm text-slate-500">
        라이더 전용 이륜차 리스·렌탈 상품을 비교하고 상담을 신청하세요.
      </p>
      <div className="space-y-3">
        {leasePlans.map((p) => (
          <Link
            key={p.id}
            href={`/lease/${p.id}`}
            className="block overflow-hidden rounded-2xl border border-slate-200 bg-white active:scale-[0.99]"
          >
            <div
              className={`flex items-center gap-3 bg-gradient-to-br ${p.gradient} p-4 text-white`}
            >
              <span className="text-4xl">{p.emoji}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium">
                    {p.sponsor}
                  </span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium">
                    {p.type} · {p.fuel}
                  </span>
                </div>
                <p className="mt-1 text-base font-bold">{p.model}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-[11px] text-slate-400">월 납입금</p>
                <p className="text-lg font-extrabold text-slate-900">
                  {won(p.monthly)}
                </p>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <p>보증금 {won(p.deposit)}</p>
                <p>약정 {p.termMonths}개월</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </SubPage>
  );
}
