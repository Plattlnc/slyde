"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== password2) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }, // 등급은 기본 개인회원(관리자가 추후 지정)
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setDone(true); // 이메일 확인 필요
    }
  }

  if (done) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-4xl">📬</div>
        <h1 className="text-lg font-bold">확인 메일을 보냈어요</h1>
        <p className="text-sm text-slate-500">
          {email} 로 보낸 메일의 링크를 눌러 인증을 완료하세요.
        </p>
        <Link href="/login" className="mt-2 text-sm font-semibold text-slate-900">
          로그인으로 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col justify-center bg-slate-50 px-6 py-10">
      <div className="mb-6 text-center">
        <div className="text-2xl font-black tracking-tight text-slate-900">
          slyde 회원가입
        </div>
        <p className="mt-1 text-sm text-slate-500">
          라이더라면 누구나 가입할 수 있어요
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          placeholder="이름 / 닉네임"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
        />
        <input
          type="email"
          required
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="비밀번호 (6자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
        />
        <input
          type="password"
          required
          placeholder="비밀번호 확인"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 ${
            password2 && password !== password2
              ? "border-rose-400"
              : "border-slate-200"
          }`}
        />
        {password2 && password !== password2 && (
          <p className="px-1 text-xs text-rose-500">비밀번호가 일치하지 않아요.</p>
        )}

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "가입 중..." : "가입하기"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        이미 계정이 있으세요?{" "}
        <Link href="/login" className="font-semibold text-slate-900">
          로그인
        </Link>
      </p>
    </div>
  );
}
