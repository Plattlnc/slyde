import Link from "next/link";

// 메뉴 하위 페이지 공통 셸 (뒤로가기 + 타이틀)
export default function SubPage({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-slate-50">
      <header className="pt-safe sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
        <div className="flex h-12 items-center gap-2 px-4">
          <Link href="/" aria-label="뒤로" className="text-xl active:scale-90">
            ←
          </Link>
          <span className="text-base font-extrabold text-slate-900">
            {emoji} {title}
          </span>
        </div>
      </header>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

// 페이지 내 "준비 중" + 예정 기능 안내 (개발 전 자리표시)
export function ComingSoon({
  desc,
  planned,
}: {
  desc: string;
  planned: string[];
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="mb-3 text-xs font-bold text-slate-500">예정 기능</p>
        <ul className="space-y-2">
          {planned.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-0.5 text-slate-300">▢</span>
              {p}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-center text-xs text-slate-400">🚧 준비 중인 페이지예요</p>
    </div>
  );
}
