"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/avatar";
import type { ChatMessage } from "@/lib/messages";

export default function ChatThread({
  otherId,
  otherName,
  otherAvatar,
  otherAvatarUrl,
  myId,
  initial,
}: {
  otherId: string;
  otherName: string;
  otherAvatar: string;
  otherAvatarUrl: string | null;
  myId: string;
  initial: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 새 메시지마다 맨 아래로
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 실시간 구독
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`dm:${myId}:${otherId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new as {
            id: string;
            sender_id: string;
            recipient_id: string;
            content: string;
            created_at: string;
          };
          const inThread =
            (m.sender_id === otherId && m.recipient_id === myId) ||
            (m.sender_id === myId && m.recipient_id === otherId);
          if (!inThread) return;
          setMessages((prev) =>
            prev.some((x) => x.id === m.id)
              ? prev
              : [
                  ...prev,
                  {
                    id: m.id,
                    content: m.content,
                    mine: m.sender_id === myId,
                    createdAt: m.created_at,
                  },
                ],
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [myId, otherId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content || busy) return;
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({ recipient_id: otherId, content })
      .select("id, sender_id, content, created_at")
      .single();
    setBusy(false);
    if (error) {
      alert("전송 실패: " + error.message);
      return;
    }
    setText("");
    if (data) {
      setMessages((prev) =>
        prev.some((x) => x.id === data.id)
          ? prev
          : [
              ...prev,
              {
                id: data.id as string,
                content: data.content as string,
                mine: true,
                createdAt: data.created_at as string,
              },
            ],
      );
    }
  }

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* 상단 바 */}
      <header className="pt-safe sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="flex h-12 items-center gap-2 px-4">
          <Link
            href="/messages"
            aria-label="뒤로"
            className="text-xl active:scale-90"
          >
            ←
          </Link>
          <Avatar
            url={otherAvatarUrl}
            emoji={otherAvatar}
            className="h-8 w-8"
            emojiClass="text-base"
          />
          <p className="text-sm font-bold text-slate-900">{otherName}</p>
        </div>
      </header>

      {/* 메시지 목록 */}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            첫 메시지를 보내보세요
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.mine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${
                m.mine
                  ? "rounded-br-md bg-blue-600 text-white"
                  : "rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 입력 */}
      <form
        onSubmit={send}
        className="pb-safe flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-2.5"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          placeholder="메시지 입력…"
          className="flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm outline-none focus:bg-slate-200/70"
        />
        <button
          type="submit"
          disabled={!text.trim() || busy}
          className="shrink-0 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-40"
        >
          전송
        </button>
      </form>
    </div>
  );
}
