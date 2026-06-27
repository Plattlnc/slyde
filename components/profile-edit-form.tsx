"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { uploadImages } from "@/lib/upload-media";
import Avatar from "@/components/avatar";
import {
  PE_AVATARS,
  PE_NAME_EMOJIS,
  BADGE_CATALOG,
  BADGE_KEYS,
  BADGE_MAX,
  type BadgeKey,
} from "@/lib/profile-options";

export default function ProfileEditForm({
  userId,
  currentEmail,
  initial,
}: {
  userId: string;
  currentEmail: string;
  initial: {
    name: string;
    avatar: string;
    avatarUrl: string | null;
    nameEmoji: string;
    bio: string;
    badges: string[];
  };
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(initial.avatar);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(initial.name);
  const [nameEmoji, setNameEmoji] = useState(initial.nameEmoji);
  const [bio, setBio] = useState(initial.bio);
  const [badges, setBadges] = useState<string[]>(initial.badges);
  const [busy, setBusy] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);

  async function changeEmail() {
    const e = newEmail.trim();
    if (!e || emailBusy) return;
    setEmailBusy(true);
    setEmailMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: e });
    setEmailBusy(false);
    if (error) {
      setEmailMsg("변경 실패: " + error.message);
      return;
    }
    setEmailMsg("✅ " + e + " 로 확인 메일을 보냈어요. 인증하면 변경됩니다.");
    setNewEmail("");
  }

  function toggleBadge(k: BadgeKey) {
    setBadges((prev) => {
      if (prev.includes(k)) return prev.filter((x) => x !== k);
      if (prev.length >= BADGE_MAX) {
        alert(`뱃지는 최대 ${BADGE_MAX}개까지 선택할 수 있어요`);
        return prev;
      }
      return [...prev, k];
    });
  }

  async function onPickPhoto(f: File | null) {
    if (!f) return;
    setUploading(true);
    try {
      const [url] = await uploadImages([f]);
      setAvatarUrl(url);
    } catch (e) {
      alert("사진 업로드 실패: " + (e instanceof Error ? e.message : ""));
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        name: name.trim() || "라이더",
        avatar,
        avatar_url: avatarUrl,
        name_emoji: nameEmoji,
        bio: bio.trim() || null,
        badges,
      })
      .eq("id", userId);
    setBusy(false);
    if (error) {
      alert("저장 실패: " + error.message);
      return;
    }
    router.push("/profile");
    router.refresh();
  }

  return (
    <div className="flex min-h-full flex-col bg-white">
      {/* 상단 */}
      <div className="pt-safe sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="flex h-12 items-center justify-between px-4">
          <Link href="/profile" className="text-sm text-slate-500 active:scale-95">
            취소
          </Link>
          <span className="text-sm font-bold text-slate-900">프로필 편집</span>
          <button
            onClick={save}
            disabled={busy}
            className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white active:scale-95 disabled:opacity-50"
          >
            {busy ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* 미리보기 */}
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
          <Avatar
            url={avatarUrl}
            emoji={avatar}
            className="h-14 w-14"
            emojiClass="text-3xl"
          />
          <div className="min-w-0">
            <div className="font-bold text-slate-900">
              {(name.trim() || "닉네임") + " 님"} {nameEmoji}
            </div>
            <div className="truncate text-xs text-slate-500">
              {bio.trim() || "소개를 입력해 보세요"}
            </div>
          </div>
        </div>

        {/* 프로필 사진 업로드 */}
        <Label>프로필 사진</Label>
        <div className="mb-5 flex items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 active:scale-95 disabled:opacity-50"
          >
            {uploading ? "업로드 중…" : "📷 사진 업로드"}
          </button>
          {avatarUrl && (
            <button
              onClick={() => setAvatarUrl(null)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-500 active:scale-95"
            >
              사진 제거
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              onPickPhoto(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </div>

        {/* 아바타 (이모지 — 사진 없을 때 사용) */}
        <Label>이모지 아바타 {avatarUrl ? "(사진 사용 중)" : ""}</Label>
        <div className="mb-5 flex flex-wrap gap-2">
          {PE_AVATARS.map((e) => (
            <button
              key={e}
              onClick={() => setAvatar(e)}
              className={`flex h-11 w-11 items-center justify-center rounded-full text-2xl ${
                avatar === e
                  ? "bg-blue-100 ring-2 ring-blue-500"
                  : "bg-slate-100"
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        {/* 닉네임 */}
        <Label>닉네임</Label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={12}
          placeholder="닉네임"
          className="mb-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />

        {/* 닉네임 옆 이모지 */}
        <Label>닉네임 옆 이모지</Label>
        <div className="mb-5 flex flex-wrap gap-2">
          {PE_NAME_EMOJIS.map((e, i) => (
            <button
              key={i}
              onClick={() => setNameEmoji(e)}
              className={`flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-xl ${
                nameEmoji === e
                  ? "bg-blue-100 ring-2 ring-blue-500"
                  : "bg-slate-100"
              } ${e === "" ? "text-xs font-semibold text-slate-500" : ""}`}
            >
              {e === "" ? "없음" : e}
            </button>
          ))}
        </div>

        {/* 소개 */}
        <Label>간단 소개</Label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={60}
          placeholder="나를 한 줄로 소개해 보세요 (최대 60자)"
          className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <div className="mb-5 mt-1 text-right text-xs text-slate-400">
          {bio.length}/60
        </div>

        {/* 이메일 변경 (인증 필요 — 저장과 별개) */}
        <Label>이메일 변경</Label>
        <p className="mb-1.5 text-xs text-slate-400">현재: {currentEmail}</p>
        <div className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="새 이메일"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
          <button
            onClick={changeEmail}
            disabled={!newEmail.trim() || emailBusy}
            className="shrink-0 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 active:scale-95 disabled:opacity-40"
          >
            {emailBusy ? "전송…" : "변경"}
          </button>
        </div>
        {emailMsg && (
          <p className="mt-1.5 text-xs text-slate-600">{emailMsg}</p>
        )}
        <div className="mb-5" />

        {/* 뱃지 */}
        <Label>뱃지 꾸미기</Label>
        <div className="flex flex-wrap gap-2">
          {BADGE_KEYS.map((k) => {
            const c = BADGE_CATALOG[k];
            const on = badges.includes(k);
            return (
              <button
                key={k}
                onClick={() => toggleBadge(k)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  on
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                {c.i} {c.l}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          최대 {BADGE_MAX}개까지 선택할 수 있어요.
        </p>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-xs font-bold text-slate-600">{children}</div>
  );
}
