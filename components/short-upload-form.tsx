"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const MAX_MB = 50;

export default function ShortUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function pick(f: File | null) {
    setError(null);
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`파일이 너무 커요 (최대 ${MAX_MB}MB)`);
      return;
    }
    const video = f.type.startsWith("video");
    setFile(f);
    setIsVideo(video);
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function upload() {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const ext = (file.name.split(".").pop() || "bin").toLowerCase();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("shorts")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from("shorts").getPublicUrl(path);

      const { error: insErr } = await supabase.from("shorts").insert({
        media_url: publicUrl,
        media_type: isVideo ? "video" : "image",
        caption: caption.trim() || null,
      });
      if (insErr) throw insErr;

      router.push("/shorts");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "업로드 실패");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-white">
      {/* 상단 바 */}
      <div className="pt-safe sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="flex h-12 items-center justify-between px-4">
          <Link href="/shorts" className="text-sm text-slate-500 active:scale-95">
            취소
          </Link>
          <span className="text-sm font-bold text-slate-900">숏폼 올리기</span>
          <button
            onClick={upload}
            disabled={!file || busy}
            className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-40"
          >
            {busy ? "올리는 중…" : "게시"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* 미디어 선택/미리보기 */}
        <button
          onClick={() => inputRef.current?.click()}
          className="relative flex aspect-[9/16] max-h-[60vh] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 active:scale-[0.99]"
        >
          {previewUrl ? (
            isVideo ? (
              <video
                src={previewUrl}
                className="h-full w-full object-contain"
                muted
                playsInline
                autoPlay
                loop
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="미리보기"
                className="h-full w-full object-contain"
              />
            )
          ) : (
            <div className="text-center text-slate-400">
              <div className="text-4xl">📷🎬</div>
              <p className="mt-2 text-sm font-medium">사진 / 영상 선택</p>
              <p className="text-xs">최대 {MAX_MB}MB</p>
            </div>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={300}
          placeholder="문구 추가… (선택)"
          className="min-h-[72px] resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        />

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
