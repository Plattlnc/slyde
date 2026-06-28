"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LeaseInquiryForm({
  planId,
  planName,
}: {
  planId: string;
  planName: string;
}) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim() || busy) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("lease_inquiries").insert({
      plan_id: planId,
      plan_name: planName,
      phone: phone.trim(),
      message: message.trim() || null,
    });
    setBusy(false);
    if (error) {
      alert("신청 실패: " + error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <div className="text-3xl">✅</div>
        <p className="mt-2 text-sm font-bold text-emerald-700">
          상담 신청이 접수됐어요
        </p>
        <p className="mt-1 text-xs text-emerald-600">
          담당자가 입력하신 번호로 연락드릴 예정입니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <p className="text-sm font-bold text-slate-800">상담 신청</p>
      <input
        type="tel"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="연락처 (예: 010-1234-5678)"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={300}
        placeholder="문의 내용 (선택)"
        className="min-h-[72px] w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
      />
      <button
        type="submit"
        disabled={!phone.trim() || busy}
        className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-40"
      >
        {busy ? "신청 중…" : "상담 신청하기"}
      </button>
    </form>
  );
}
