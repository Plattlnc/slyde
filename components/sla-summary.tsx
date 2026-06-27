import { slaStats } from "@/lib/mock-data";

export default function SlaSummary() {
  return (
    // 헤더 위로 살짝 겹치는 카드
    <section className="-mt-4 px-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">오늘의 운행 요약</h2>
          <a href="/dashboard" className="text-xs font-medium text-blue-600">
            전체 보기 →
          </a>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {slaStats.map((s) => (
            <div key={s.label} className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900">
                  {s.value}
                </span>
                {s.unit && (
                  <span className="text-xs text-slate-500">{s.unit}</span>
                )}
              </p>
              {s.trend && (
                <span
                  className={`mt-1 inline-block text-xs font-medium ${
                    s.good ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {s.trend}
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] text-slate-400">
          * 배달장부 연동 데이터 (데모) — 실제 연동 예정
        </p>
      </div>
    </section>
  );
}
