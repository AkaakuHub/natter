"use client";

import React, { useRef, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGlobalKeyboardShortcuts } from "@/hooks/useGlobalKeyboardShortcuts";
import { useAppState } from "@/contexts/AppStateContext";
import Header from "./Header";
import { FooterMenu } from "../FooterMenu";
import Welcome from "../Welcome";
import CreatePostModal from "../CreatePostModal";
import ShortcutHelpModal from "../ShortcutHelpModal";
import { usePathname } from "next/navigation";

interface BaseLayoutProps {
  children?: React.ReactNode;
}

const BaseLayout = ({ children }: BaseLayoutProps) => {
  const { session, userExists, isLoading, createUserAndRefresh } =
    useCurrentUser();
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isModalOpen, isInputFocused } = useAppState();
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isShortcutHelpModalOpen, setIsShortcutHelpModalOpen] = useState(false);

  // グローバルキーボードショートカット
  useGlobalKeyboardShortcuts({
    onCreatePost: () => {
      if (session && userExists) {
        setIsCreatePostModalOpen(true);
      }
    },
    onSearch: () => {
      // 検索機能（今後実装）
      console.log("検索ショートカット");
    },
    onHelp: () => {
      setIsShortcutHelpModalOpen(true);
    },
    isModalOpen:
      isModalOpen || isCreatePostModalOpen || isShortcutHelpModalOpen,
    isInputFocused,
  });

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
        className="flex-1 overflow-y-auto bg-surface-variant mb-[60px]"
      >
        {children}
      </div>

      {/* フッターメニュー */}
      <FooterMenu path={pathname} scrollContainerRef={scrollContainerRef} />

      {/* グローバルモーダル */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onPostCreated={() => {
          // 投稿作成後のハンドリング
          setIsCreatePostModalOpen(false);
          // グローバルイベントを発火してタイムラインをリフレッシュ
          window.dispatchEvent(new CustomEvent("postCreated"));
        }}
        currentUser={
          session?.user
            ? {
                id: session.user.id,
                name: session.user.name || "Unknown User",
                image: session.user.image || undefined,
                twitterId: session.user.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : null
        }
      />

      <ShortcutHelpModal
        isOpen={isShortcutHelpModalOpen}
        onClose={() => setIsShortcutHelpModalOpen(false)}
      />
    </div>
  );
};

export default BaseLayout;
