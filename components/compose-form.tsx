"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { uploadImages } from "@/lib/upload-media";

const MAX_IMAGES = 4;

export default function ComposeForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canPost =
    (text.trim().length > 0 || files.length > 0 || !!video) && !loading;

  function addFiles(list: FileList | null) {
    if (!list) return;
    const arr = Array.from(list);
    const vid = arr.find((f) => f.type.startsWith("video"));
    if (vid) {
      setVideo(vid);
      setFiles([]);
      return;
    }
    const imgs = arr.filter((f) => f.type.startsWith("image"));
    setVideo(null);
    setFiles((prev) => [...prev, ...imgs].slice(0, MAX_IMAGES));
  }

  async function submit() {
    if (!canPost) return;
    setLoading(true);
    setError(null);
    try {
      let image_urls: string[] = [];
      let video_url: string | null = null;
      if (video) {
        [video_url] = await uploadImages([video]);
      } else if (files.length) {
        image_urls = await uploadImages(files);
      }
      const supabase = createClient();
      const { error } = await supabase
        .from("posts")
        .insert({ content: text.trim() || null, image_urls, video_url });
      if (error) throw error;
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "게시 실패");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-white">
      {/* 상단 바 */}
      <div className="pt-safe sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="flex h-12 items-center justify-between px-4">
          <Link href="/" className="text-sm text-slate-500 active:scale-95">
            취소
          </Link>
          <span className="text-sm font-bold text-slate-900">새 글</span>
          <button
            onClick={submit}
            disabled={!canPost}
            className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-40"
          >
            {loading ? "게시 중…" : "게시"}
          </button>
        </div>
      </div>

      {/* 작성 영역 */}
      <div className="flex flex-1 flex-col px-4 py-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl">
            🛵
          </div>
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            placeholder="무슨 일이 있나요? 라이더들과 나눠보세요."
            className="min-h-[140px] flex-1 resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-slate-400"
          />
        </div>

        {/* 동영상 미리보기 */}
        {video && (
          <div className="relative mt-3 w-48">
            <video
              src={URL.createObjectURL(video)}
              className="w-full rounded-lg bg-black"
              muted
              playsInline
            />
            <button
              onClick={() => setVideo(null)}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs text-white"
              aria-label="삭제"
            >
              ✕
            </button>
          </div>
        )}

        {/* 첨부 사진 미리보기 */}
        {files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div key={i} className="relative h-24 w-24">
                <img
                  src={URL.createObjectURL(f)}
                  alt="첨부"
                  className="h-full w-full rounded-lg object-cover"
                />
                <button
                  onClick={() =>
                    setFiles((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs text-white"
                  aria-label="삭제"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
            {error}
          </p>
        )}

        {/* 하단: 미디어 첨부 + 글자수 */}
        <div className="mt-auto flex items-center justify-between pt-3">
          <button
            onClick={() => fileRef.current?.click()}
            aria-label="사진·동영상 첨부"
            className="text-2xl text-slate-500 active:scale-90"
          >
            🖼️
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <span className="text-xs text-slate-400">{text.length}/1000</span>
        </div>
      </div>
    </div>
  );
}
