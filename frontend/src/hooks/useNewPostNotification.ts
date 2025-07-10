"use client";

import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface NewPostNotificationState {
  hasNewPosts: boolean;
  newPostCount: number;
  lastPostId: string | null;
}

export const useNewPostNotification = () => {
  const queryClient = useQueryClient();
  const [state, setState] = useState<NewPostNotificationState>({
    hasNewPosts: false,
    newPostCount: 0,
    lastPostId: null,
  });

  // タブのvisibility状態を監視
  const [isTabActive, setIsTabActive] = useState(true);

  const checkForNewPosts = useCallback(async () => {
    try {
      // タイムラインデータをキャッシュから取得
      const timelineData = queryClient.getQueryData(["posts", "timeline"]);

      if (!timelineData || !Array.isArray(timelineData)) return;

      const posts = timelineData as Array<{
        id: string;
        createdAt: string;
        [key: string]: unknown;
      }>;
      if (posts.length === 0) return;

      const latestPost = posts[0];
      const latestPostId = latestPost.id;

      // 初回設定
      if (!state.lastPostId) {
        setState((prev) => ({ ...prev, lastPostId: latestPostId }));
        return;
      }

      // 新しいポストがあるかチェック
      if (latestPostId !== state.lastPostId) {
        const newPosts = posts.filter(
          (post) => new Date(post.createdAt) > new Date(getLastCheckTime()),
        );

        if (newPosts.length > 0) {
          setState((prev) => ({
            ...prev,
            hasNewPosts: true,
            newPostCount: newPosts.length,
            lastPostId: latestPostId,
          }));

          // 非アクティブタブの場合、ブラウザ通知も表示
          if (!isTabActive && Notification.permission === "granted") {
            new Notification("Natter", {
              body: `${newPosts.length}件の新しい投稿があります`,
              icon: "/icon.png",
              tag: "new-posts",
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to check for new posts:", error);
    }
  }, [state.lastPostId, isTabActive, queryClient]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isActive = !document.hidden;
      setIsTabActive(isActive);

      if (isActive && state.hasNewPosts) {
        // タブがアクティブになったときに新ポストをチェック
        checkForNewPosts();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [state.hasNewPosts, checkForNewPosts]);

  // 定期的に新ポストをチェック（タブが非アクティブの時のみ）
  useEffect(() => {
    if (isTabActive) return;

    const interval = setInterval(() => {
      checkForNewPosts();
    }, 30000); // 30秒ごと

    return () => clearInterval(interval);
  }, [isTabActive, checkForNewPosts]);

  // 新ポスト通知をクリックした時の処理
  const handleNewPostClick = useCallback(() => {
    // タイムラインを更新
    queryClient.invalidateQueries({ queryKey: ["posts", "timeline"] });

    // 通知状態をリセット
    setState((prev) => ({
      ...prev,
      hasNewPosts: false,
      newPostCount: 0,
    }));

    // ページトップまでスクロール
    window.scrollTo({ top: 0, behavior: "smooth" });

    // スクロールコンテナがある場合はそちらもスクロール
    const scrollContainer = document.querySelector("[data-scroll-container]");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    }

    // 最後のチェック時間を更新
    setLastCheckTime();
  }, [queryClient]);

  // ブラウザ通知の許可を要求
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  // 最後のチェック時間を取得
  const getLastCheckTime = () => {
    return (
      localStorage.getItem("natter-last-check") || new Date().toISOString()
    );
  };

  // 最後のチェック時間を設定
  const setLastCheckTime = () => {
    localStorage.setItem("natter-last-check", new Date().toISOString());
  };

  // ページロード時に通知許可を要求
  useEffect(() => {
    requestNotificationPermission();
    setLastCheckTime();
  }, [requestNotificationPermission]);

  return {
    hasNewPosts: state.hasNewPosts,
    newPostCount: state.newPostCount,
    isTabActive,
    handleNewPostClick,
    checkForNewPosts,
  };
};
