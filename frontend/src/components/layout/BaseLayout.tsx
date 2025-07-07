"use client";

import React from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Header from "./Header";
import { FooterMenu } from "../FooterMenu";
import Welcome from "../Welcome";
import { usePathname } from "next/navigation";

interface BaseLayoutProps {
  children?: React.ReactNode;
}

const BaseLayout = ({ children }: BaseLayoutProps) => {
  const { session, userExists, isLoading, createUserAndRefresh } =
    useCurrentUser();
  const pathname = usePathname();

  // パスから現在のページタイプを判定
  const getCurrentPageType = () => {
    if (pathname === "/") return "timeline";
    if (pathname.startsWith("/profile")) return "profile";
    if (pathname.startsWith("/post")) return "detailedpost";
    if (pathname.startsWith("/notification")) return "notification";
    if (pathname.startsWith("/set-list")) return "set-list";
    return "";
  };

  // ローディング状態
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="w-full h-screen flex flex-col">
        <Header progress={1} />
        <div className="flex-1 overflow-y-auto">{children}</div>
        <FooterMenu path={getCurrentPageType()} />
      </div>
    );
  }

  if (userExists === false && session) {
    return <Welcome session={session} onUserCreated={createUserAndRefresh} />;
  }

  return (
    <div className="w-full h-screen flex flex-col">
      {/* ヘッダー */}
      <Header
        profileImage={session?.user?.image || "no_avatar_image_128x128.png"}
        progress={1}
        userId={session?.user?.id}
      />

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto bg-white">{children}</div>

      {/* フッターメニュー */}
      <FooterMenu path={getCurrentPageType()} />
    </div>
  );
};

export default BaseLayout;
