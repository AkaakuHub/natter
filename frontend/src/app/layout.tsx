// "use client";

// import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

import NextAuthProvider from "@/app/providers";
import { auth } from "@/auth";
import { ToastProvider } from "@/hooks/useToast";
import { AppStateProvider } from "@/contexts/AppStateContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
      </head>
      <body
        className={`${geistSans.variable} antialiased bg-surface text-text`}
      >
        <NextAuthProvider>
          <AppStateProvider>
            <ToastProvider>{children}</ToastProvider>
          </AppStateProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
