import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/logout-button";

const tierBadge: Record<string, string> = {
  기업회원: "bg-indigo-100 text-indigo-700",
  협력사회원: "bg-blue-100 text-blue-700",
  개인회원: "bg-slate-100 text-slate-600",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비로그인 → 로그인 유도
  if (!user) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-5xl">🛵</div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">로그인이 필요해요</h1>
          <p className="mt-1 text-sm text-slate-500">
            로그인하고 내 프로필과 실적을 확인하세요.
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Link
            href="/login"
            className="rounded-xl bg-blue-600 py-3 text-sm font-bold text-white active:scale-[0.98]"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 active:scale-[0.98]"
          >
            회원가입
          </Link>
        </div>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, tier, company")
    .eq("id", user.id)
    .single();

  const name = profile?.name ?? "라이더";
  const tier = profile?.tier ?? "개인회원";
  const company = profile?.company;

  return (
    <div className="min-h-full bg-slate-50">
      {/* 프로필 헤더 */}
      <div className="pt-safe bg-gradient-to-b from-blue-600 to-blue-500 px-5 pb-6 text-white">
        <div className="flex items-center gap-4 pt-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl">
            🛵
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-lg font-bold">{name} 님</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  tierBadge[tier] ?? "bg-white/20"
                }`}
              >
                {tier}
              </span>
            </div>
            {company && (
              <p className="text-xs text-blue-100">{company}</p>
            )}
            <p className="mt-0.5 truncate text-xs text-blue-100">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* 메뉴 */}
      <div className="space-y-3 px-4 py-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {[
            { href: "/dashboard", emoji: "📊", label: "내 실적 (SLA)" },
            { href: "/accident", emoji: "🚨", label: "사고접수 내역" },
            { href: "/shop", emoji: "🛍️", label: "주문 내역" },
          ].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 text-sm text-slate-700 active:bg-slate-50 ${
                i > 0 ? "border-t border-slate-100" : ""
              }`}
            >
              <span className="w-6 text-center text-lg">{item.emoji}</span>
              {item.label}
              <span className="ml-auto text-slate-300">›</span>
            </Link>
          ))}
        </div>

        <LogoutButton />
      </div>
    </div>
  );
}
