"use client";

import React, { useEffect } from "react";
import PostComponent from "../Post";
import CreatePostButton from "../CreatePostButton";
import SkeletonCard from "../common/SkeletonCard";
import { User } from "../../api";
import { transformPostToPostComponent } from "@/utils/postTransformers";
import { ExtendedSession } from "@/types";
import { usePosts } from "@/hooks/queries/usePosts";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS, type PostWithUser } from "@/hooks/queries/usePosts";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useScrollContainer } from "@/hooks/useScrollContainer";
import { audioPlayer } from "@/utils/audioUtils";

interface TimeLineProps {
  session?: ExtendedSession;
  currentUser?: User | null;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

const TimeLine = ({ currentUser, scrollContainerRef }: TimeLineProps) => {
  const { data: posts, isLoading, error, refetch } = usePosts();
  const queryClient = useQueryClient();
  const autoScrollContainerRef = useScrollContainer();

  const handlePostUpdate = () => {
    // usePostActionsで楽観的更新済みのため、再取得は不要
  };

  const handlePostDelete = (postId: number) => {
    // React Queryのキャッシュを更新
    queryClient.setQueryData(
      QUERY_KEYS.posts,
      (oldPosts: PostWithUser[] | undefined) =>
        oldPosts?.filter((post) => post.id !== postId) || [],
    );
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const { isPulling, pullDistance, isRefreshing, containerRef } =
    usePullToRefresh({
      onRefresh: handleRefresh,
      threshold: 80,
      enableSound: true,
      scrollContainerRef: scrollContainerRef || autoScrollContainerRef,
    });

  // グローバルな投稿作成イベントを監視
  useEffect(() => {
    const handleGlobalPostCreated = () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts });
    };

    // ユーザーインタラクションを初期化
    const handleUserInteraction = () => {
      audioPlayer.markUserInteraction();
      document.removeEventListener("touchstart", handleUserInteraction);
      document.removeEventListener("click", handleUserInteraction);
    };

    window.addEventListener("postCreated", handleGlobalPostCreated);
    document.addEventListener("touchstart", handleUserInteraction, {
      passive: true,
    });
    document.addEventListener("click", handleUserInteraction);

    return () => {
      window.removeEventListener("postCreated", handleGlobalPostCreated);
      document.removeEventListener("touchstart", handleUserInteraction);
      document.removeEventListener("click", handleUserInteraction);
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto flex justify-center py-8">
        <div className="text-error">Failed to load posts</div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="w-full max-w-md mx-auto relative"
        style={{
          transform: isPulling
            ? `translateY(${Math.min(pullDistance, 40)}px)`
            : "none",
          transition: isPulling ? "none" : "transform 0.2s ease-out",
          touchAction: "pan-y", // 垂直スクロールを許可
        }}
      >
        {/* プルトゥリフレッシュインジケーター */}
        {(isPulling || isRefreshing) && (
          <div
            className="fixed top-[-38px] left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-center"
            style={{
              opacity: isPulling ? Math.min(pullDistance / 80, 1) : 1,
            }}
          >
            <div className="bg-surface rounded-full p-2 shadow-lg border border-border">
              <div
                className={`w-4 h-4 border-2 border-interactive border-t-transparent rounded-full ${
                  isRefreshing ? "animate-spin" : ""
                }`}
                style={{
                  transform:
                    !isRefreshing && isPulling
                      ? `rotate(${pullDistance * 4}deg)`
                      : "none",
                }}
              />
            </div>
          </div>
        )}

        {/* 投稿一覧 */}
        {posts && posts.length > 0 ? (
          posts.map((post) => {
            const transformed = transformPostToPostComponent(post);
            if (!transformed) return null;

            const { transformedUser, transformedPost } = transformed;

            return (
              <PostComponent
                key={post.id}
                user={transformedUser}
                post={transformedPost}
                currentUser={currentUser}
                onPostUpdate={handlePostUpdate}
                onPostDelete={() => handlePostDelete(post.id)}
              />
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-center">
              <p className="text-text-secondary text-lg mb-2">
                まだ投稿がありません
              </p>
              <p className="text-text-secondary text-sm">
                あなたが最初の発言者になりましょう！
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 投稿作成ボタン */}
      <CreatePostButton
        onClick={() => {
          // nキーと同じ動作をトリガー
          const event = new KeyboardEvent("keydown", { key: "n" });
          document.dispatchEvent(event);
        }}
      />
    </>
  );
};

export default TimeLine;
