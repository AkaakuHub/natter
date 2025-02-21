import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { getServerSession } from "next-auth";
import SessionProvider from "@/components/SessionProvider";
import { nextAuthOptions } from "@/utils/next-auth-options";
import { ExtendedSession } from "@/types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Natter",
  description: "A simple post app",
};

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
        <link
          rel="manifest"
          href="manifest.json"
          crossOrigin="use-credentials"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session as ExtendedSession}>{children}</SessionProvider>
      </body>
    </html>
  );
}
