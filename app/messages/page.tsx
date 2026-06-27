import Link from "next/link";
import { fetchConversations } from "@/lib/messages";

export default async function MessagesPage() {
  const conversations = await fetchConversations();

  return (
    <div className="min-h-full bg-slate-50">
      {/* 상단 바 */}
      <header className="pt-safe sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
        <div className="flex h-12 items-center justify-between px-4">
          <span className="text-base font-extrabold text-slate-900">메시지</span>
          <Link
            href="/messages/new"
            className="text-sm font-semibold text-blue-600 active:scale-95"
          >
            ✏️ 새 메시지
          </Link>
        </div>
      </header>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
          <div className="text-5xl">✉️</div>
          <p className="text-sm text-slate-500">아직 대화가 없어요</p>
          <Link
            href="/messages/new"
            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white active:scale-95"
          >
            새 메시지 보내기
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {conversations.map((c) => (
            <Link
              key={c.otherId}
              href={`/messages/${c.otherId}`}
              className="flex items-center gap-3 bg-white px-4 py-3 active:bg-slate-50"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-2xl">
                🛵
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-bold text-slate-900">
                    {c.name}
                  </span>
                  <span className="shrink-0 text-[11px] text-slate-400">
                    {c.time}
                  </span>
                </div>
                <p className="truncate text-xs text-slate-500">
                  {c.fromMe ? "나: " : ""}
                  {c.lastText}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
