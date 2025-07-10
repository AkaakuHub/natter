"use client";

import React, { useRef, useState, lazy, Suspense } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGlobalKeyboardShortcuts } from "@/hooks/useGlobalKeyboardShortcuts";
import { useAppState } from "@/contexts/AppStateContext";
import { useTrueSPARouter } from "@/core/router/TrueSPARouter";
import { useHybridSPAAuth } from "@/core/auth/HybridSPAAuth";
import Header from "./Header";
import { HybridFooterMenu } from "../HybridFooterMenu";
import Welcome from "../Welcome";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// 遅延読み込みコンポーネント（既存の優れた実装保護）
const CreatePostModal = lazy(() => import("../CreatePostModal"));
const ShortcutHelpModal = lazy(() => import("../ShortcutHelpModal"));
const TrendingPosts = lazy(() => import("../Sidebar/TrendingPosts"));
const RecommendedUsers = lazy(() => import("../Sidebar/RecommendedUsers"));
const NewPostBanner = lazy(() => import("../NewPostBanner"));

interface HybridBaseLayoutProps {
  children?: React.ReactNode;
}

const HybridBaseLayout = ({ children }: HybridBaseLayoutProps) => {
  const { session, userExists, isLoading, createUserAndRefresh } =
    useCurrentUser();
  const { currentRoute, navigate } = useTrueSPARouter();
  const { isHydrated, isInitialLoad } = useHybridSPAAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isModalOpen, isInputFocused } = useAppState();
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isShortcutHelpModalOpen, setIsShortcutHelpModalOpen] = useState(false);

  // 大画面かどうかを判定
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  // グローバルキーボードショートカット（既存機能保護）
  useGlobalKeyboardShortcuts({
    onCreatePost: () => {
      if (session && userExists) {
        setIsCreatePostModalOpen(true);
      }
    },
    onSearch: () => {
      // ハイブリッドナビゲーション
      if (isInitialLoad || !isHydrated) {
        window.location.href = "/search";
      } else {
        navigate("/search");
      }
    },
    onHelp: () => {
      setIsShortcutHelpModalOpen(true);
    },
    isModalOpen:
      isModalOpen || isCreatePostModalOpen || isShortcutHelpModalOpen,
    isInputFocused,
  });

  // ローディング状態（既存実装保護）
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
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    );
  }

  if (userExists === false && session) {
    return <Welcome session={session} onUserCreated={createUserAndRefresh} />;
  }

  return (
    <div className="w-full h-screen flex flex-col">
      {/* 新ポスト通知バナー */}
      {session && userExists && (
        <Suspense fallback={<div />}>
          <NewPostBanner />
        </Suspense>
      )}

      {/* ヘッダー（既存の優れた実装保護） */}
      <Header
        profileImage={session?.user?.image || "no_avatar_image_128x128.png"}
        progress={1}
        userId={session?.user?.id}
        scrollContainerRef={scrollContainerRef}
      />

      {/* メインコンテンツエリア（既存実装保護） */}
      <div className="flex-1 flex overflow-hidden">
        {/* メインコンテンツ */}
        <div
          ref={scrollContainerRef}
          data-scroll-container
          className="flex-1 overflow-y-auto bg-surface-variant max-w-md mx-auto lg:mx-0 lg:max-w-none scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingBottom: "60px",
          }}
        >
          {children}
        </div>

        {/* サイドバー（大画面のみ表示）（既存実装保護） */}
        {isLargeScreen && (
          <div className="w-80 bg-surface border-l border-border mb-[60px] overflow-y-auto">
            <div className="p-4 space-y-6">
              <Suspense
                fallback={
                  <div className="h-32 bg-surface-variant animate-pulse rounded-lg" />
                }
              >
                <TrendingPosts />
              </Suspense>
              <Suspense
                fallback={
                  <div className="h-32 bg-surface-variant animate-pulse rounded-lg" />
                }
              >
                <RecommendedUsers currentUserId={session?.user?.id} />
              </Suspense>
            </div>
          </div>
        )}
      </div>

      {/* フッターメニュー（ハイブリッド対応） */}
      <HybridFooterMenu
        path={currentRoute?.path || "/"}
        scrollContainerRef={scrollContainerRef}
      />

      {/* グローバルモーダル（既存実装保護） */}
      {isCreatePostModalOpen && (
        <Suspense fallback={<div />}>
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
        </Suspense>
      )}

      {isShortcutHelpModalOpen && (
        <Suspense fallback={<div />}>
          <ShortcutHelpModal
            isOpen={isShortcutHelpModalOpen}
            onClose={() => setIsShortcutHelpModalOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
};

export default HybridBaseLayout;
