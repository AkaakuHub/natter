"use client";

import React, { useRef } from "react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ローディング状態
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-interactive"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="w-full h-screen flex flex-col">
        <Header progress={1} />
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          {children}
        </div>
        <FooterMenu path={pathname} scrollContainerRef={scrollContainerRef} />
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
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto bg-surface-variant"
      >
        {children}
      </div>

      {/* フッターメニュー */}
      <FooterMenu path={pathname} scrollContainerRef={scrollContainerRef} />
    </div>
  );
};

export default BaseLayout;
