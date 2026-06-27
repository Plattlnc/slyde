import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/bottom-nav";
import PageTransition from "@/components/page-transition";
import { getCurrentProfile } from "@/lib/profile";

export const metadata: Metadata = {
  title: "slyde — 라이더 슈퍼앱",
  description: "배달 라이더를 위한 SLA 대시보드 · 서비스 · 커뮤니티",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "slyde",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // 안전영역(env safe-area-inset) 활성화
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentProfile();
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="bg-slate-200 text-slate-900 sm:grid sm:min-h-dvh sm:place-items-center sm:p-6">
        {/* Fredoka 워드마크 폰트 (React가 head로 hoist) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500&display=swap"
        />
        {/* 앱 셸: 모바일=전체화면, 데스크톱=폰 프레임 */}
        <div className="device relative mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-slate-50 shadow-xl sm:h-[860px] sm:max-h-[92dvh] sm:rounded-[2.5rem] sm:shadow-2xl sm:ring-[10px] sm:ring-slate-900">
          {/* 스크롤 영역 */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
            <PageTransition>{children}</PageTransition>
          </main>
          {/* 하단 탭바 (앱 셸 하단 고정) */}
          <BottomNav profile={profile} />
        </div>
      </body>
    </html>
  );
}
