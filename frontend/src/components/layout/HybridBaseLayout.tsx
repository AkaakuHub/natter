"use client";

import React, { useRef, useState, lazy, Suspense } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGlobalKeyboardShortcuts } from "@/hooks/useGlobalKeyboardShortcuts";
import { useAppState } from "@/contexts/AppStateContext";
import { useTrueSPARouter } from "@/core/router/TrueSPARouter";
import { useHybridSPAAuth } from "@/core/auth/HybridSPAAuth";
import { useServerStatus } from "@/contexts/ServerStatusContext";
import Header from "./Header";
import { HybridFooterMenu } from "../HybridFooterMenu";
import Welcome from "../Welcome";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSwipeBackNavigation } from "@/hooks/useSwipeBackNavigation";
import ServerErrorBanner from "../common/ServerErrorBanner";
import { avatarImageUrl } from "@/utils/avatarImage";
import SkeletonLoading from "../common/SkeletonLoading";
import {
  AppViewport,
  MainContentArea,
  PlainScrollContainer,
} from "./AppScrollLayout";

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
  const { isOnline } = useServerStatus();
  const { currentRoute, navigate } = useTrueSPARouter();
  const { isHydrated, isInitialLoad } = useHybridSPAAuth();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isModalOpen, isInputFocused } = useAppState();
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isShortcutHelpModalOpen, setIsShortcutHelpModalOpen] = useState(false);

  // 大画面かどうかを判定
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const currentPath = currentRoute?.path || "/";
  const isSwipeBackReady =
    isOnline === true && !isLoading && Boolean(session) && userExists === true;

  useSwipeBackNavigation({
    disabled:
      !isSwipeBackReady ||
      isLargeScreen ||
      currentPath === "/" ||
      isModalOpen ||
      isCreatePostModalOpen ||
      isShortcutHelpModalOpen ||
      isInputFocused ||
      isInitialLoad ||
      !isHydrated,
    onBack: () => window.history.back(),
    scrollContainerRef,
  });

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

  // 【最優先】サーバーがオフラインの場合はエラーメッセージを表示
  if (isOnline === false) {
    return (
      <AppViewport>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <ServerErrorBanner />
            <div className="mt-4 text-center">
              <p className="text-sm text-text-secondary">
                サーバーが復旧するまでお待ちください
              </p>
            </div>
          </div>
        </div>
      </AppViewport>
    );
  }

  // サーバーステータスチェック中
  if (isOnline === null) {
    return <SkeletonLoading />;
  }

  // セッションローディング中
  if (isLoading) {
    return <SkeletonLoading />;
  }

  if (!session) {
    return (
      <AppViewport>
        <PlainScrollContainer ref={scrollContainerRef}>
          {children}
        </PlainScrollContainer>
      </AppViewport>
    );
  }

  if (userExists === false && session) {
    return <Welcome session={session} onUserCreated={createUserAndRefresh} />;
  }

  return (
    <AppViewport>
      {/* 新ポスト通知バナー */}
      {session && userExists && (
        <Suspense fallback={<div />}>
          <NewPostBanner />
        </Suspense>
      )}

      {/* ヘッダー（既存の優れた実装保護） */}
      <Header
        profileImage={avatarImageUrl(session?.user?.image)}
        progress={1}
        userId={session?.user?.id}
        scrollContainerRef={scrollContainerRef}
      />

      <MainContentArea
        scrollContainerRef={scrollContainerRef}
        sidebar={
          isLargeScreen ? (
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
          ) : null
        }
      >
        {children}
      </MainContentArea>

      {/* フッターメニュー（ハイブリッド対応） */}
      <HybridFooterMenu
        path={currentPath}
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
    </AppViewport>
  );
};

export default HybridBaseLayout;
