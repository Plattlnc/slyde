"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadImages } from "@/lib/upload-media";
import Avatar from "@/components/avatar";
import {
  ImageIcon,
  VideoIcon,
  EmojiIcon,
  LocationIcon,
} from "@/components/icons";
import type { CurrentProfile } from "@/lib/profile";

const MAX_IMAGES = 4;
const EMOJIS = [
  "😀", "😂", "🥹", "😎", "😭", "🥲", "🤔", "😡",
  "🔥", "❤️", "👍", "🙏", "🎉", "✨", "💪", "😴",
  "🛵", "🚗", "📦", "⛽", "🍜", "☕", "☔", "💦",
];

export default function InlineComposer({
  profile,
}: {
  profile?: CurrentProfile | null;
}) {
  const router = useRouter();
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);
  const gifRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [locating, setLocating] = useState(false);

  const canPost =
    (text.trim().length > 0 || files.length > 0 || !!video) && !busy;

  function addFiles(list: FileList | null) {
    if (!list) return;
    setOpen(true);
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

  function insertEmoji(e: string) {
    setText((t) => t + e);
    setOpen(true);
    taRef.current?.focus();
  }

  function addLocation() {
    if (!navigator.geolocation || locating) return;
    setOpen(true);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const r = await fetch(`/api/geo?lat=${latitude}&lng=${longitude}`);
          const d = await r.json();
          if (d.region)
            setText((t) => (t ? t.replace(/\s*📍.*$/, "") + " " : "") + `📍 ${d.region}`);
        } catch {
          /* noop */
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
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
      setShowEmoji(false);
      setOpen(false);
      router.refresh();
    } catch (e) {
      alert("게시 실패: " + (e instanceof Error ? e.message : ""));
    } finally {
      setBusy(false);
    }
  }

  const ToolBtn = ({
    onClick,
    label,
    children,
  }: {
    onClick: () => void;
    label: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition active:scale-90 active:bg-slate-100"
    >
      {children}
    </button>
  );

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
            ref={taRef}
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

          {/* 이모지 팔레트 */}
          {showEmoji && (
            <div className="mb-2 grid grid-cols-8 gap-1 rounded-xl bg-slate-50 p-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => insertEmoji(e)}
                  className="rounded-lg py-1 text-xl active:scale-90 active:bg-slate-200"
                >
                  {e}
                </button>
              ))}
            </div>
          )}

          {(open || text || files.length > 0 || video) && (
            <div className="mt-1 flex items-center gap-0.5">
              <ToolBtn onClick={() => imgRef.current?.click()} label="사진">
                <ImageIcon size={20} />
              </ToolBtn>
              <ToolBtn onClick={() => vidRef.current?.click()} label="동영상">
                <VideoIcon size={20} />
              </ToolBtn>
              <button
                type="button"
                onClick={() => gifRef.current?.click()}
                aria-label="GIF"
                className="flex h-8 items-center rounded-md border border-slate-400 px-1.5 text-[10px] font-extrabold leading-none text-slate-600 transition active:scale-90"
              >
                GIF
              </button>
              <ToolBtn onClick={() => setShowEmoji((v) => !v)} label="이모지">
                <EmojiIcon size={20} />
              </ToolBtn>
              <ToolBtn onClick={addLocation} label="위치">
                <LocationIcon size={20} />
              </ToolBtn>

              <div className="ml-auto flex items-center gap-2">
                {locating && (
                  <span className="text-[11px] text-slate-400">위치…</span>
                )}
                {text.length > 0 && (
                  <span
                    className={`text-[11px] tabular-nums ${
                      text.length > 900 ? "text-rose-500" : "text-slate-400"
                    }`}
                  >
                    {text.length}/1000
                  </span>
                )}
                <button
                  onClick={post}
                  disabled={!canPost}
                  className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-40"
                >
                  {busy ? "게시 중…" : "게시"}
                </button>
              </div>

              {/* 숨김 입력 */}
              <input
                ref={imgRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <input
                ref={vidRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <input
                ref={gifRef}
                type="file"
                accept="image/gif"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
