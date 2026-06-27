/* eslint-disable @next/next/no-img-element */

// 프로필 아바타: 업로드 사진(avatarUrl) 우선, 없으면 이모지
export default function Avatar({
  url,
  emoji,
  className = "",
  emojiClass = "",
}: {
  url?: string | null;
  emoji?: string | null;
  className?: string; // 크기/모양 (예: "h-16 w-16")
  emojiClass?: string; // 이모지 폰트 크기 (예: "text-3xl")
}) {
  if (url) {
    return (
      <img
        src={url}
        alt="프로필"
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-slate-100 ${className} ${emojiClass}`}
    >
      {emoji || "🛵"}
    </div>
  );
}
