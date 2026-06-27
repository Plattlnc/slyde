import { adBanners } from "@/lib/mock-data";

export default function AdCarousel() {
  return (
    <section className="pt-5">
      <div className="mb-3 flex items-center justify-between px-4">
        <h2 className="text-sm font-bold text-slate-800">제휴 · 광고</h2>
        <span className="text-[11px] text-slate-400">AD</span>
      </div>
      {/* 가로 스크롤 배너 */}
      <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
        {adBanners.map((ad) => (
          <a
            key={ad.id}
            href={`/ads/${ad.id}`}
            className={`relative flex min-w-[80%] snap-start flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${ad.gradient} p-4 text-white shadow-sm`}
          >
            <div>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium">
                {ad.sponsor}
              </span>
              <h3 className="mt-2 text-base font-bold leading-snug">
                {ad.title}
              </h3>
              <p className="mt-1 text-xs text-white/90">{ad.subtitle}</p>
            </div>
            <span className="mt-4 self-start rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
              자세히 보기
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
