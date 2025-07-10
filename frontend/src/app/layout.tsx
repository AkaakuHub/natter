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
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <meta name="apple-mobile-web-app-title" content="Natter" />
        <meta property="og:title" content="Natter" />
        <meta property="og:description" content="A simple post app" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://natter.akaaku.net" />
        <meta
          property="og:image"
          content="https://natter.akaaku.net/og-image.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Natter" />
        <meta name="twitter:description" content="A simple post app" />
        <meta
          name="twitter:image"
          content="https://natter.akaaku.net/og-image.png"
        />
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
