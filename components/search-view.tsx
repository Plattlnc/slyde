"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/avatar";

type UserHit = {
  id: string;
  name: string;
  tier: string;
  avatar: string;
  avatar_url: string | null;
};
type PostHit = {
  id: string;
  content: string | null;
  author_name: string | null;
};

const tierBadge: Record<string, string> = {
  기업회원: "bg-indigo-100 text-indigo-700",
  협력사회원: "bg-blue-100 text-blue-700",
  개인회원: "bg-slate-100 text-slate-600",
};

export default function SearchView() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<UserHit[]>([]);
  const [posts, setPosts] = useState<PostHit[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setUsers([]);
      setPosts([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const supabase = createClient();
      const [u, p] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, name, tier, avatar, avatar_url")
          .ilike("name", `%${term}%`)
          .limit(20),
        supabase
          .from("posts")
          .select("id, content, author_name")
          .ilike("content", `%${term}%`)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      if (cancelled) return;
      setUsers((u.data as UserHit[]) ?? []);
      setPosts((p.data as PostHit[]) ?? []);
      setLoading(false);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  const empty = q.trim() && !loading && users.length === 0 && posts.length === 0;

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      {/* 상단: 검색 입력 */}
      <header className="pt-safe sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
        <div className="flex h-12 items-center gap-2 px-3">
          <Link href="/" aria-label="뒤로" className="px-1 text-xl active:scale-90">
            ←
          </Link>
          <div className="flex flex-1 items-center gap-2 rounded-full bg-slate-200/70 px-3 py-2">
            <span className="text-slate-400">🔍</span>
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="라이더·게시글 검색"
              className="w-full bg-transparent text-sm outline-none"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                aria-label="지우기"
                className="text-slate-400"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {!q.trim() && (
        <p className="px-4 py-10 text-center text-sm text-slate-400">
          라이더 닉네임이나 글 내용을 검색해보세요
        </p>
      )}
      {empty && (
        <p className="px-4 py-10 text-center text-sm text-slate-400">
          “{q}” 검색 결과가 없어요
        </p>
      )}

      {/* 사용자 결과 */}
      {users.length > 0 && (
        <>
          <p className="px-4 pb-1 pt-3 text-xs font-bold text-slate-500">라이더</p>
          <div className="divide-y divide-slate-100">
            {users.map((u) => (
              <Link
                key={u.id}
                href={`/u/${u.id}`}
                className="flex items-center gap-3 bg-white px-4 py-3 active:bg-slate-50"
              >
                <Avatar
                  url={u.avatar_url}
                  emoji={u.avatar}
                  className="h-10 w-10"
                  emojiClass="text-lg"
                />
                <span className="text-sm font-semibold text-slate-900">
                  {u.name}
                </span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    tierBadge[u.tier] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {u.tier}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* 게시글 결과 */}
      {posts.length > 0 && (
        <>
          <p className="px-4 pb-1 pt-3 text-xs font-bold text-slate-500">게시글</p>
          <div className="divide-y divide-slate-100">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/post/${p.id}`}
                className="block bg-white px-4 py-3 active:bg-slate-50"
              >
                <p className="line-clamp-2 text-sm text-slate-800">
                  {p.content || "(사진)"}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {p.author_name ?? "라이더"}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
