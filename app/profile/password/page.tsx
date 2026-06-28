"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pw !== pw2) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (pw.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <header className="pt-safe sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
        <div className="flex h-12 items-center gap-2 px-4">
          <Link href="/profile" aria-label="뒤로" className="text-xl active:scale-90">
            ←
          </Link>
          <span className="text-base font-extrabold text-slate-900">
            비밀번호 변경
          </span>
        </div>
      </header>

      <div className="px-6 py-6">
        {done ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="text-4xl">✅</div>
            <p className="text-sm font-bold text-slate-800">
              비밀번호가 변경됐어요
            </p>
            <Link
              href="/profile"
              className="mt-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white active:scale-95"
            >
              프로필로
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input
              type="password"
              required
              minLength={6}
              placeholder="새 비밀번호 (6자 이상)"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
            <input
              type="password"
              required
              placeholder="새 비밀번호 확인"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 ${
                pw2 && pw !== pw2 ? "border-rose-400" : "border-slate-200"
              }`}
            />
            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
            >
              {busy ? "변경 중..." : "비밀번호 변경"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
