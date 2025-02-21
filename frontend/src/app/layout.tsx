// "use client";

// import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import NextAuthProvider from "@/app/providers";
import { LayoutProvider } from "@/components/layout/useLayout";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/utils/next-auth-options";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
  const session = await getServerSession(nextAuthOptions);

  return (
    <html lang="ja">
      <head>
        <meta name="apple-mobile-web-app-title" content="MyWebSite" />
        <link rel="manifest" href="manifest.json" crossOrigin="use-credentials" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextAuthProvider>
          <LayoutProvider>
            {children}
          </LayoutProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
