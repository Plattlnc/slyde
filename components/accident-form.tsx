"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { uploadImages } from "@/lib/upload-media";

const TYPES = ["차량 단독", "상대 차량", "보행자", "기타"];
const INJURIES = ["없음", "경상", "중상"];

export default function AccidentForm() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [detail, setDetail] = useState("");
  const [injury, setInjury] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [doneNo, setDoneNo] = useState<string | null>(null);

  async function submit() {
    if (busy) return;
    if (!type || !place.trim()) {
      alert("사고 유형과 장소는 입력해주세요.");
      return;
    }
    setBusy(true);
    try {
      let image_urls: string[] = [];
      if (files.length) image_urls = await uploadImages(files);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("accident_reports")
        .insert({
          type,
          occurred_at: time ? new Date(time).toISOString() : null,
          place: place.trim(),
          detail: detail.trim() || null,
          injury: injury || null,
          image_urls,
        })
        .select("id")
        .single();
      if (error) throw error;
      setDoneNo((data?.id as string)?.slice(0, 8).toUpperCase() ?? "SLD");
    } catch (e) {
      alert("접수 실패: " + (e instanceof Error ? e.message : ""));
      setBusy(false);
    }
  }

  if (doneNo) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-slate-50 px-8 text-center">
        <div className="text-5xl">✅</div>
        <h1 className="text-lg font-bold text-slate-900">
          사고접수가 완료되었어요
        </h1>
        <p className="text-sm text-slate-500">
          접수번호 <b>#SLD-{doneNo}</b>
          <br />
          담당 보험사가 곧 연락드립니다.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white active:scale-95"
        >
          확인
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <header className="pt-safe sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
        <div className="flex h-12 items-center gap-2 px-4">
          <Link href="/" aria-label="뒤로" className="text-xl active:scale-90">
            ←
          </Link>
          <span className="text-base font-extrabold text-slate-900">사고접수</span>
        </div>
      </header>

      <div className="space-y-4 px-4 py-4">
        {/* 긴급 안내 */}
        <div className="flex items-center justify-between gap-2 rounded-xl bg-rose-50 px-4 py-3">
          <span className="text-xs text-rose-700">
            ⚠️ 인명 피해가 있다면 119·112에 먼저 신고하세요
          </span>
          <a
            href="tel:119"
            className="shrink-0 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-bold text-white"
          >
            긴급전화
          </a>
        </div>

        {/* 사고 유형 */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600">
            사고 유형
          </label>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  type === t
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 사고 일시 */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600">
            사고 일시
          </label>
          <input
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>

        {/* 사고 장소 */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600">
            사고 장소
          </label>
          <input
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="예) 인천 서구 청라대로 123 앞"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>

        {/* 사고 경위 */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600">
            사고 경위
          </label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="어떻게 사고가 발생했는지 적어주세요"
            className="min-h-[88px] w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>

        {/* 현장 사진 */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600">
            현장 사진
          </label>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white py-4 text-sm text-slate-500 active:scale-[0.99]"
          >
            📷 사진 첨부 (최대 5장)
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const imgs = Array.from(e.target.files ?? []).filter((f) =>
                f.type.startsWith("image"),
              );
              setFiles((prev) => [...prev, ...imgs].slice(0, 5));
              e.target.value = "";
            }}
          />
          {files.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative h-20 w-20">
                  <img
                    src={URL.createObjectURL(f)}
                    alt="첨부"
                    className="h-full w-full rounded-lg object-cover"
                  />
                  <button
                    onClick={() =>
                      setFiles((p) => p.filter((_, idx) => idx !== i))
                    }
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs text-white"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 부상 여부 */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600">
            부상 여부
          </label>
          <div className="flex gap-2">
            {INJURIES.map((t) => (
              <button
                key={t}
                onClick={() => setInjury(t)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  injury === t
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={submit}
          disabled={busy}
          className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? "접수 중…" : "사고 접수하기"}
        </button>
      </div>
    </div>
  );
}
