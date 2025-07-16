// "use client";

// import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

import NextAuthProvider from "@/app/providers";
import { auth } from "@/auth";
import { ToastProvider } from "@/hooks/useToast";
import { AppStateProvider } from "@/contexts/AppStateContext";
import { ServerStatusProvider } from "@/contexts/ServerStatusContext";
import ClientLayout from "@/components/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // フォントの読み込み戦略を最適化
  preload: true, // 明示的にプリロードを有効化
});

// export const metadata: Metadata = {
//   title: "Natter",
//   description: "A simple post app",
// };

// layout providerのせいで犠牲に...

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await auth();

  return (
    <html lang="ja">
      <head>
        <title>Natter</title>
        <meta name="description" content="A simple post app" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <meta name="apple-mobile-web-app-title" content="Natter" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* OGP meta tags are handled by generateMetadata in page.tsx */}
        <meta
          httpEquiv="Cache-Control"
          content="no-cache, no-store, must-revalidate"
        />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <link
          rel="manifest"
          href="/manifest.json"
          crossOrigin="use-credentials"
        />
        {/* スプラッシュスクリーン用ロゴを最優先で読み込み */}
        <link
          rel="preload"
          as="image"
          href="/images/logo.png"
          fetchPriority="high"
        />
      </head>
      <body
        className={`${geistSans.variable} antialiased bg-surface text-text`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 初期スプラッシュ用のダークモード早期検出（Hydration前）
              (function() {
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches ||
                              localStorage.getItem('theme') === 'dark';
                if (isDark) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        {/* CSS版のスプラッシュスクリーン（即座に表示） */}
        <div id="initial-splash" className="initial-splash">
          <div className="initial-splash-content">
            {/* ロゴ */}
            <div className="initial-splash-logo-container">
              <img
                src="/images/logo.png"
                alt="Natter Logo"
                className="initial-splash-logo-image"
              />
            </div>

            {/* アプリ名 */}
            <div style={{ textAlign: "center" }}>
              <h1 className="initial-splash-title">Natter</h1>
              <p className="initial-splash-subtitle">Connect & Share</p>
            </div>

            {/* プログレスバー用のスペース確保（非表示） */}
            <div
              style={{
                width: "20rem",
                maxWidth: "24rem",
                height: "3rem",
                opacity: 0,
              }}
            ></div>

            {/* ローディングドット用のスペース確保（非表示） */}
            <div style={{ height: "0.5rem", opacity: 0 }}></div>
          </div>
        </div>
        <NextAuthProvider>
          <ServerStatusProvider>
            <AppStateProvider>
              <ToastProvider>
                <ClientLayout>{children}</ClientLayout>
              </ToastProvider>
            </AppStateProvider>
          </ServerStatusProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
