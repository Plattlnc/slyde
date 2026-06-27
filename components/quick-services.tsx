import { quickServices } from "@/lib/mock-data";

export default function QuickServices() {
  return (
    <section className="px-4 pt-5">
      <h2 className="mb-3 text-sm font-bold text-slate-800">빠른 서비스</h2>
      <div className="grid grid-cols-4 gap-2">
        {quickServices.map((svc) => (
          <a
            key={svc.id}
            href={svc.href}
            className={`flex flex-col items-center gap-2 rounded-2xl p-3 text-center transition active:scale-95 ${
              svc.highlight
                ? "bg-rose-50 ring-1 ring-rose-200"
                : "bg-white ring-1 ring-slate-100"
            }`}
          >
            <span className="text-2xl">{svc.emoji}</span>
            <span
              className={`text-xs font-medium ${
                svc.highlight ? "text-rose-600" : "text-slate-700"
              }`}
            >
              {svc.label}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
