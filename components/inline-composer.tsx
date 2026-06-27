"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadImages } from "@/lib/upload-media";
import Avatar from "@/components/avatar";
import type { CurrentProfile } from "@/lib/profile";

const MAX_IMAGES = 4;

// 홈에서 바로 작성 → 게시 (사진/gif 여러 장 또는 동영상 1개)
export default function InlineComposer({
  profile,
}: {
  profile?: CurrentProfile | null;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const canPost =
    (text.trim().length > 0 || files.length > 0 || !!video) && !busy;

  function addFiles(list: FileList | null) {
    if (!list) return;
    setOpen(true);
    const arr = Array.from(list);
    const vid = arr.find((f) => f.type.startsWith("video"));
    if (vid) {
      // 동영상은 1개 (사진과 배타)
      setVideo(vid);
      setFiles([]);
      return;
    }
    const imgs = arr.filter((f) => f.type.startsWith("image"));
    setVideo(null);
    setFiles((prev) => [...prev, ...imgs].slice(0, MAX_IMAGES));
  }

  async function post() {
    if (!canPost) return;
    setBusy(true);
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
      setText("");
      setFiles([]);
      setVideo(null);
      setOpen(false);
      router.refresh();
    } catch (e) {
      alert("게시 실패: " + (e instanceof Error ? e.message : ""));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex gap-3">
        <Avatar
          url={profile?.avatarUrl}
          emoji={profile?.avatarEmoji}
          className="h-10 w-10"
          emojiClass="text-xl"
        />
        <div className="min-w-0 flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setOpen(true)}
            maxLength={1000}
            placeholder="무슨 일이 있나요?"
            className={`w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-slate-400 ${
              open || text ? "min-h-[56px]" : "min-h-[24px]"
            }`}
          />

          {/* 동영상 미리보기 */}
          {video && (
            <div className="relative mb-2 w-40">
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

          {/* 사진/gif 미리보기 */}
          {files.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative h-20 w-20">
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

          {(open || text || files.length > 0 || video) && (
            <div className="mt-1 flex items-center justify-between">
              <button
                onClick={() => fileRef.current?.click()}
                aria-label="사진·동영상 첨부"
                className="text-xl text-slate-500 active:scale-90"
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
              <button
                onClick={post}
                disabled={!canPost}
                className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-40"
              >
                {busy ? "게시 중…" : "게시"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
