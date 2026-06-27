"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset`,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-4xl">📬</div>
        <h1 className="text-lg font-bold">재설정 메일을 보냈어요</h1>
        <p className="text-sm text-slate-500">
          {email} 로 보낸 메일의 링크를 눌러 새 비밀번호를 설정하세요.
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
          비밀번호 찾기
        </div>
        <p className="mt-1 text-sm text-slate-500">
          가입한 이메일로 재설정 링크를 보내드려요
        </p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? "전송 중..." : "재설정 메일 받기"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="font-semibold text-blue-600">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
