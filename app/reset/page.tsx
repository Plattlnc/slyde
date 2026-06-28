"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPage() {
  const router = useRouter();
  const [ready, setReady] = useState<"loading" | "ok" | "invalid">("loading");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // 메일 링크 처리: code(PKCE) / token_hash(verifyOtp) / 해시 세션 모두 대응
  useEffect(() => {
    const supabase = createClient();
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const tokenHash = url.searchParams.get("token_hash");
    const type = url.searchParams.get("type");
    let done = false;
    const ok = () => {
      if (!done) {
        done = true;
        setReady("ok");
      }
    };

    // supabase-js가 해시(#access_token...)를 자동 감지하면 여기로 들어옴
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) ok();
    });

    (async () => {
      try {
        if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });
          if (!error) return ok();
        }
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) return ok();
        }
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) return ok();
        // 해시 자동감지 잠깐 대기
        setTimeout(async () => {
          if (done) return;
          const {
            data: { session: s },
          } = await supabase.auth.getSession();
          if (s) ok();
          else setReady("invalid");
        }, 1800);
      } catch {
        if (!done) setReady("invalid");
      }
    })();

    return () => sub.subscription.unsubscribe();
  }, []);

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

  if (ready === "loading") {
    return (
      <div className="flex min-h-full items-center justify-center text-sm text-slate-400">
        확인 중…
      </div>
    );
  }
  if (ready === "invalid") {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-4xl">⚠️</div>
        <p className="text-sm text-slate-600">
          유효하지 않거나 만료된 링크예요.
          <br />
          비밀번호 찾기를 다시 시도해주세요.
        </p>
        <Link href="/forgot" className="text-sm font-semibold text-slate-900">
          비밀번호 찾기
        </Link>
      </div>
    );
  }
  if (done) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-4xl">✅</div>
        <h1 className="text-lg font-bold">비밀번호가 변경됐어요</h1>
        <button
          onClick={() => {
            router.push("/");
            router.refresh();
          }}
          className="mt-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white active:scale-95"
        >
          홈으로
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col justify-center bg-slate-50 px-6 py-10">
      <div className="mb-6 text-center">
        <div className="text-2xl font-black tracking-tight text-slate-900">
          새 비밀번호 설정
        </div>
      </div>
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
    </div>
  );
}
