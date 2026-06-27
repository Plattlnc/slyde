"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { rider } from "@/lib/mock-data";

type IconProps = { active?: boolean };

function HomeIcon({ active }: IconProps) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M3 9.7 12 3l9 6.7V20a1 1 0 0 1-1 1h-5v-6.5H9V21H4a1 1 0 0 1-1-1V9.7Z"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShortsIcon({ active }: IconProps) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M10 8.5 16 12l-6 3.5v-7Z"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 8v8M8 12h8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MessageIcon({ active }: IconProps) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M21.5 2.5 11 13M21.5 2.5 14.5 21l-3.7-7.8L3 9.5 21.5 2.5Z"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const tabs = [
  { href: "/", label: "홈", Icon: HomeIcon },
  { href: "/shorts", label: "숏폼", Icon: ShortsIcon },
  { href: "/create", label: "만들기", Icon: PlusIcon }, // ＋ → 카메라 생성
  { href: "/messages", label: "메시지", Icon: MessageIcon },
  { href: "/profile", label: "프로필", Icon: null }, // 아바타로
];

const HIDDEN_ON = [
  "/login",
  "/signup",
  "/compose",
  "/shorts/new",
  "/create",
  "/messages/", // 채팅방·새 메시지 (목록 /messages 는 유지)
  "/post/", // 글 상세
];

export default function BottomNav() {
  const pathname = usePathname();

  // 로그인/회원가입에선 하단바 숨김
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav className="pb-safe z-10 shrink-0 border-t border-slate-200 bg-white">
      <ul className="flex">
        {tabs.map((tab) => {
          const active =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-label={tab.label}
                aria-current={active ? "page" : undefined}
                className={`flex h-14 items-center justify-center active:scale-90 ${
                  active ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {tab.Icon ? (
                  <tab.Icon active={active} />
                ) : (
                  // 내 프로필 = 아바타 (활성 시 링)
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-base ${
                      active ? "ring-2 ring-slate-900" : ""
                    }`}
                  >
                    {rider.avatarEmoji}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
