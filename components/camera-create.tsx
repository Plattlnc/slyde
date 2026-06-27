"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Mode = "동영상" | "Shorts" | "라이브" | "게시물";
const MODES: Mode[] = ["동영상", "Shorts", "라이브", "게시물"];

export default function CameraCreate() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intentRef = useRef<"photo" | "video">("photo");
  const pressStartRef = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("Shorts");
  const [facing, setFacing] = useState<"user" | "environment">("environment");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [camError, setCamError] = useState(false);

  // 카메라 시작/재시작
  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCamError(false);
      } catch {
        setCamError(true);
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facing]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  async function uploadBlob(blob: Blob, type: "image" | "video", ext: string) {
    setBusy(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("shorts")
        .upload(path, blob, {
          contentType: blob.type || (type === "video" ? "video/webm" : "image/jpeg"),
        });
      if (upErr) throw upErr;
      const {
        data: { publicUrl },
      } = supabase.storage.from("shorts").getPublicUrl(path);
      const { error: insErr } = await supabase
        .from("shorts")
        .insert({ media_url: publicUrl, media_type: type, caption: null });
      if (insErr) throw insErr;
      stopCamera();
      router.push("/shorts");
      router.refresh();
    } catch (e) {
      alert("업로드 실패: " + (e instanceof Error ? e.message : ""));
      setBusy(false);
    }
  }

  function capturePhoto() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d")?.drawImage(v, 0, 0);
    canvas.toBlob(
      (b) => {
        if (b) uploadBlob(b, "image", "jpg");
      },
      "image/jpeg",
      0.9,
    );
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;
    chunksRef.current = [];
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const rec = new MediaRecorder(stream, { mimeType: mime });
    rec.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data);
    };
    rec.onstop = () => {
      if (intentRef.current === "video") {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        if (blob.size > 0) uploadBlob(blob, "video", "webm");
      }
    };
    recorderRef.current = rec;
    rec.start();
    setRecording(true);
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  // 셔터: 탭=사진, 길게=영상
  function onShutterDown() {
    if (busy || camError) return;
    pressStartRef.current = Date.now();
    intentRef.current = "video";
    startRecording();
  }
  function onShutterUp() {
    if (busy || camError) return;
    const elapsed = Date.now() - pressStartRef.current;
    if (elapsed < 350) {
      // 탭 → 사진 (녹화분 버림)
      intentRef.current = "photo";
      stopRecording();
      capturePhoto();
    } else {
      intentRef.current = "video";
      stopRecording();
    }
  }

  function selectMode(m: Mode) {
    if (m === "게시물") {
      stopCamera();
      router.push("/compose");
      return;
    }
    if (m === "라이브") {
      alert("라이브 방송은 준비 중이에요 🔴");
      return;
    }
    setMode(m);
  }

  function onPickFile(f: File | null) {
    if (!f) return;
    const type = f.type.startsWith("video") ? "video" : "image";
    const ext = (f.name.split(".").pop() || "bin").toLowerCase();
    uploadBlob(f, type, ext);
  }

  const canShoot = mode === "동영상" || mode === "Shorts";

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* 카메라 미리보기 */}
      {camError ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 px-8 text-center text-white/70">
          <span className="text-4xl">📷🚫</span>
          <p className="text-sm">카메라를 사용할 수 없어요.</p>
          <p className="text-xs">권한을 허용하거나, 아래 갤러리로 올려보세요.</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      )}

      {/* 상단: 닫기 */}
      <div className="pt-safe absolute inset-x-0 top-0 flex items-center justify-between p-4">
        <Link
          href="/"
          aria-label="닫기"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-xl text-white active:scale-90"
        >
          ✕
        </Link>
        {!camError && (
          <button
            onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
            aria-label="카메라 전환"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-lg text-white active:scale-90"
          >
            🔄
          </button>
        )}
      </div>

      {/* 하단 컨트롤 */}
      <div className="pb-safe absolute inset-x-0 bottom-0 pb-4">
        {/* 촬영 버튼 줄 */}
        <div className="mb-4 flex items-center justify-around px-10">
          {/* 갤러리 */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            aria-label="갤러리"
            className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 text-xl text-white active:scale-90"
          >
            🖼️
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          />

          {/* 셔터 */}
          <button
            onPointerDown={canShoot ? onShutterDown : undefined}
            onPointerUp={canShoot ? onShutterUp : undefined}
            onPointerLeave={canShoot && recording ? onShutterUp : undefined}
            disabled={!canShoot || busy}
            aria-label="촬영"
            className={`flex h-20 w-20 items-center justify-center rounded-full border-4 transition active:scale-95 disabled:opacity-40 ${
              recording ? "border-red-500" : "border-white"
            }`}
          >
            <span
              className={`transition-all ${
                recording
                  ? "h-7 w-7 rounded bg-red-500"
                  : "h-14 w-14 rounded-full bg-white"
              }`}
            />
          </button>

          {/* 빈 칸 (균형) */}
          <div className="h-11 w-11" />
        </div>

        {busy && (
          <p className="mb-2 text-center text-xs text-white">업로드 중…</p>
        )}
        {canShoot && !busy && (
          <p className="mb-2 text-center text-[11px] text-white/60">
            탭 = 사진 · 길게 누르면 = 영상
          </p>
        )}

        {/* 모드 탭 */}
        <div className="no-scrollbar flex justify-center gap-5 overflow-x-auto px-4 text-sm font-semibold">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => selectMode(m)}
              className={`whitespace-nowrap pb-1 ${
                mode === m
                  ? "border-b-2 border-white text-white"
                  : "text-white/50"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
