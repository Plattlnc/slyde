"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Tier = "개인회원" | "협력사회원" | "기업회원";

const TIERS: { value: Tier; label: string; desc: string }[] = [
  { value: "개인회원", label: "개인 라이더", desc: "협력사 미소속 (누구나 가입)" },
  { value: "협력사회원", label: "협력사 라이더", desc: "협력사 소속 라이더" },
  { value: "기업회원", label: "기업/협력사", desc: "업체 계정" },
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tier, setTier] = useState<Tier>("개인회원");
  const [company, setCompany] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | "session" | "confirm">(null);
  const [loading, setLoading] = useState(false);

  const needCompany = tier !== "개인회원";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, tier, company: needCompany ? company : "" },
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // 이메일 확인 꺼져있으면 바로 세션 생성됨 → 홈으로
    if (data.session) {
      setDone("session");
      router.push("/");
      router.refresh();
    } else {
      setDone("confirm"); // 확인 메일 발송된 경우
    }
  }

  if (done === "confirm") {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-4xl">📬</div>
        <h1 className="text-lg font-bold">확인 메일을 보냈어요</h1>
        <p className="text-sm text-slate-500">
          {email} 로 보낸 메일의 링크를 눌러 인증을 완료하세요.
        </p>
        <Link href="/login" className="mt-2 text-sm font-semibold text-blue-600">
          로그인으로 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col justify-center bg-slate-50 px-6 py-10">
      <div className="mb-6 text-center">
        <div className="text-2xl font-black tracking-tight text-blue-600">
          slyde 회원가입
        </div>
        <p className="mt-1 text-sm text-slate-500">
          라이더라면 누구나 가입할 수 있어요
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* 회원 등급 선택 */}
        <div className="grid grid-cols-3 gap-2">
          {TIERS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTier(t.value)}
              className={`rounded-xl border px-2 py-2.5 text-center transition ${
                tier === t.value
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              <div className="text-xs font-bold">{t.label}</div>
            </button>
          ))}
        </div>
        <p className="px-1 text-[11px] text-slate-400">
          {TIERS.find((t) => t.value === tier)?.desc}
        </p>

        <input
          required
          placeholder="이름 / 닉네임"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        {needCompany && (
          <input
            required
            placeholder="소속 협력사 / 업체명"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
        )}
        <input
          type="email"
          required
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="비밀번호 (6자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
        />

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "가입 중..." : "가입하기"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        이미 계정이 있으세요?{" "}
        <Link href="/login" className="font-semibold text-blue-600">
          로그인
        </Link>
      </p>
    </div>
  );
}
