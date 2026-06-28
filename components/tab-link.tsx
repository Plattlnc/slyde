"use client";

import { useRouter } from "next/navigation";

// 캐러셀의 특정 탭으로 이동 (홈으로 가서 해당 패널로 스크롤)
export default function TabLink({
  index,
  className,
  children,
}: {
  index: number;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        try {
          sessionStorage.setItem("slyde:goto", String(index));
        } catch {}
        router.push("/");
      }}
    >
      {children}
    </button>
  );
}
