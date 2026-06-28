"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Avatar from "@/components/avatar";
import type { CurrentProfile } from "@/lib/profile";

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
  "/forgot",
  "/reset",
  "/profile/password",
  "/compose",
  "/shorts/new",
  "/create",
  "/messages/", // 채팅방·새 메시지 (목록 /messages 는 유지)
  "/post/", // 글 상세
  "/u/", // 유저 프로필·팔로워·팔로잉
  "/shop/cart", // 장바구니(자체 주문 바)
  "/accident", // 사고접수 폼
  "/profile/edit", // 프로필 편집 폼
  "/search", // 검색
  "/notifications", // 알림
];

// 캐러셀 패널 인덱스
const CINDEX: Record<string, number> = {
  "/": 0,
  "/shorts": 1,
  "/messages": 2,
  "/profile": 3,
};

export default function BottomNav({
  profile,
}: {
  profile?: CurrentProfile | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState<number>(CINDEX[pathname] ?? -1);

  // 캐러셀 스냅 → 활성 탭 동기화
  useEffect(() => {
    const h = (e: Event) => setActiveIdx((e as CustomEvent<number>).detail);
    window.addEventListener("slyde:tab", h);
    return () => window.removeEventListener("slyde:tab", h);
  }, []);
  useEffect(() => {
    setActiveIdx(CINDEX[pathname] ?? -1);
  }, [pathname]);

  // 로그인/회원가입 등에선 하단바 숨김
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  const inCarousel = CINDEX[pathname] !== undefined;

  function handle(href: string) {
    const ci = CINDEX[href];
    if (ci !== undefined) {
      if (inCarousel) {
        // 이미 캐러셀 안 → 페이지 이동 없이 해당 패널로 스크롤
        window.dispatchEvent(new CustomEvent("slyde:goto-tab", { detail: ci }));
        setActiveIdx(ci);
      } else {
        // 서브페이지 → 홈으로 가서 해당 탭에 안착
        try {
          sessionStorage.setItem("slyde:goto", String(ci));
        } catch {}
        router.push("/");
      }
    } else {
      router.push(href);
    }
  }

  return (
    <nav className="pb-safe z-10 shrink-0 border-t border-slate-200 bg-white">
      <ul className="flex">
        {tabs.map((tab) => {
          const ci = CINDEX[tab.href];
          const active =
            ci !== undefined ? ci === activeIdx : pathname.startsWith(tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <button
                onClick={() => handle(tab.href)}
                aria-label={tab.label}
                aria-current={active ? "page" : undefined}
                className={`flex h-14 w-full items-center justify-center active:scale-90 ${
                  active ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {tab.Icon ? (
                  <tab.Icon active={active} />
                ) : (
                  // 내 프로필 = 실제 아바타 (활성 시 링)
                  <Avatar
                    url={profile?.avatarUrl}
                    emoji={profile?.avatarEmoji}
                    className={`h-7 w-7 ${active ? "ring-2 ring-slate-900" : ""}`}
                    emojiClass="text-base"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
