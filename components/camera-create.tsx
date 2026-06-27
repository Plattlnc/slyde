"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Mode = "동영상" | "Shorts" | "라이브" | "게시물";
const MODES: Mode[] = ["동영상", "Shorts", "라이브", "게시물"];

type Pending = {
  blob: Blob;
  type: "image" | "video";
  url: string;
  ext: string;
};

export default function CameraCreate() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intentRef = useRef<"photo" | "video">("photo");
  const pressStartRef = useRef(0);
  const recordingRef = useRef(false);
  const longTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedThisPressRef = useRef(false);
  const videoFileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("Shorts");
  const [facing, setFacing] = useState<"user" | "environment">("environment");
  const [recording, setRecording] = useState(false);
  const [camError, setCamError] = useState(false);

  // 편집 단계
  const [pending, setPending] = useState<Pending | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);

  const needCamera = mode === "Shorts" && !pending;

  // 카메라 시작/재시작 (Shorts 촬영 단계에서만)
  useEffect(() => {
    if (!needCamera) return;
    let cancelled = false;
    (async () => {
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
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facing, needCamera]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  // ── 캡처 → 편집(pending) ──
  function capturePhoto() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d")?.drawImage(v, 0, 0);
    canvas.toBlob(
      (b) => {
        if (b)
          setPending({ blob: b, type: "image", url: URL.createObjectURL(b), ext: "jpg" });
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
      if (intentRef.current !== "video") return;
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      if (blob.size > 0)
        setPending({ blob, type: "video", url: URL.createObjectURL(blob), ext: "webm" });
    };
    recorderRef.current = rec;
    rec.start();
    recordingRef.current = true;
    setRecording(true);
  }
  function stopRecording() {
    recorderRef.current?.stop();
    recordingRef.current = false;
    setRecording(false);
  }

  const LONG = 350;
  // 짧은 탭=사진, 길게 눌렀다 떼면=녹화 시작(유지), 녹화 중 탭=정지
  function onShutterDown() {
    if (busy || camError) return;
    pressStartRef.current = Date.now();
    startedThisPressRef.current = false;
    if (recordingRef.current) return; // 녹화 중이면 손 뗄 때(탭) 정지 처리
    longTimerRef.current = setTimeout(() => {
      startedThisPressRef.current = true;
      intentRef.current = "video";
      startRecording();
    }, LONG);
  }
  function onShutterUp() {
    if (busy || camError) return;
    if (longTimerRef.current) {
      clearTimeout(longTimerRef.current);
      longTimerRef.current = null;
    }
    if (recordingRef.current) {
      if (startedThisPressRef.current) return; // 방금 길게 눌러 시작 → 계속 녹화
      intentRef.current = "video"; // 녹화 중 탭 → 정지
      stopRecording();
    } else {
      const elapsed = Date.now() - pressStartRef.current;
      if (elapsed < LONG) capturePhoto(); // 짧은 탭 → 사진
    }
  }
  function onShutterLeave() {
    // 길게 누르는 중 손이 벗어나면(아직 녹화 전) 타이머 취소
    if (longTimerRef.current && !recordingRef.current) {
      clearTimeout(longTimerRef.current);
      longTimerRef.current = null;
    }
  }

  function onPickVideo(f: File | null) {
    if (!f) return;
    const ext = (f.name.split(".").pop() || "mp4").toLowerCase();
    setPending({ blob: f, type: "video", url: URL.createObjectURL(f), ext });
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
    if (m === "동영상") {
      // 저장된 동영상 선택
      setTimeout(() => videoFileRef.current?.click(), 0);
    }
  }

  // ── 게시 (편집 완료 → 업로드) ──
  async function publish() {
    if (!pending || busy) return;
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
      const path = `${user.id}/${crypto.randomUUID()}.${pending.ext}`;
      const { error: upErr } = await supabase.storage
        .from("shorts")
        .upload(path, pending.blob, {
          contentType:
            pending.blob.type ||
            (pending.type === "video" ? "video/webm" : "image/jpeg"),
        });
      if (upErr) throw upErr;
      const {
        data: { publicUrl },
      } = supabase.storage.from("shorts").getPublicUrl(path);
      const { error: insErr } = await supabase.from("shorts").insert({
        media_url: publicUrl,
        media_type: pending.type,
        caption: caption.trim() || null,
      });
      if (insErr) throw insErr;
      // 피드(게시글)에도 자동 등록
      await supabase.from("posts").insert({
        content: caption.trim() || null,
        image_urls: pending.type === "image" ? [publicUrl] : [],
        video_url: pending.type === "video" ? publicUrl : null,
      });
      stopCamera();
      router.push("/shorts");
      router.refresh();
    } catch (e) {
      alert("업로드 실패: " + (e instanceof Error ? e.message : ""));
      setBusy(false);
    }
  }

  function retake() {
    if (pending) URL.revokeObjectURL(pending.url);
    setPending(null);
    setCaption("");
  }

  // ════════════ 편집 화면 ════════════
  if (pending) {
    return (
      <div className="flex h-full w-full flex-col bg-black">
        <div className="pt-safe flex items-center justify-between p-4 text-white">
          <button onClick={retake} className="text-sm active:scale-95">
            ← 다시
          </button>
          <span className="text-sm font-bold">편집</span>
          <button
            onClick={publish}
            disabled={busy}
            className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-black active:scale-95 disabled:opacity-50"
          >
            {busy ? "게시 중…" : "게시"}
          </button>
        </div>

        {/* 미리보기 */}
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          {pending.type === "video" ? (
            <video
              src={pending.url}
              className="max-h-full max-w-full"
              controls
              loop
              playsInline
            />
          ) : (
            <img
              src={pending.url}
              alt="미리보기"
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>

        {/* 문구 입력 (편집) */}
        <div className="pb-safe bg-black p-4">
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={300}
            placeholder="문구 추가… (선택)"
            className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
          />
        </div>
      </div>
    );
  }

  // ════════════ 촬영/선택 화면 ════════════
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* 미리보기 (Shorts 모드) */}
      {mode === "Shorts" && !camError ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 px-8 text-center text-white/70">
          <span className="text-5xl">{mode === "동영상" ? "🎞️" : "📷"}</span>
          <p className="text-sm">
            {mode === "동영상"
              ? "저장된 동영상을 선택하세요"
              : camError
                ? "카메라를 사용할 수 없어요"
                : ""}
          </p>
        </div>
      )}

      <input
        ref={videoFileRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          onPickVideo(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />

      {/* 상단: 닫기 / 전환 */}
      <div className="pt-safe absolute inset-x-0 top-0 flex items-center justify-between p-4">
        <Link
          href="/"
          aria-label="닫기"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-xl text-white active:scale-90"
        >
          ✕
        </Link>
        {mode === "Shorts" && !camError && (
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
        <div className="mb-4 flex items-center justify-center px-10">
          {mode === "Shorts" ? (
            <button
              onPointerDown={onShutterDown}
              onPointerUp={onShutterUp}
              onPointerLeave={onShutterLeave}
              disabled={camError}
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
          ) : (
            <button
              onClick={() => videoFileRef.current?.click()}
              className="rounded-full bg-white px-6 py-3.5 text-sm font-bold text-black active:scale-95"
            >
              🎞️ 동영상 선택
            </button>
          )}
        </div>

        {mode === "Shorts" && !camError && (
          <p className="mb-2 text-center text-[11px] text-white/60">
            {recording
              ? "● 녹화 중 — 탭하면 정지"
              : "탭 = 사진 · 길게 = 영상 녹화 시작"}
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
