"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

  // stateのrefを保持してコールバック内で最新値を参照
  const stateRef = useRef(state);
  stateRef.current = state;

  const checkForNewPosts = useCallback(async () => {
    try {
      console.log("🔥 [NewPost] Checking for new posts...");

      // タイムラインクエリを強制的に再取得
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      await queryClient.refetchQueries({ queryKey: ["posts"] });

      // キャッシュから最新データを取得
      const timelineData = queryClient.getQueryData(["posts"]);
      console.log("🔥 [NewPost] Timeline data:", timelineData);

      if (!timelineData || !Array.isArray(timelineData)) {
        console.log("🔥 [NewPost] No timeline data available");
        return;
      }

      const posts = timelineData as Array<{
        id: string;
        createdAt: string;
        [key: string]: unknown;
      }>;

      if (posts.length === 0) {
        console.log("🔥 [NewPost] No posts in timeline");
        return;
      }

      const latestPost = posts[0];
      const latestPostId = latestPost.id;
      console.log(
        "🔥 [NewPost] Latest post ID:",
        latestPostId,
        "Last known ID:",
        state.lastPostId,
      );

      // 初回設定
      if (!state.lastPostId) {
        console.log("🔥 [NewPost] Setting initial last post ID");
        setState((prev) => ({ ...prev, lastPostId: latestPostId }));
        return;
      }

      // 新しいポストがあるかチェック
      if (latestPostId !== state.lastPostId) {
        console.log("🔥 [NewPost] New posts detected!");

        // 前回チェック以降の新しいポストを取得
        const lastCheckTime = getLastCheckTime();
        const newPosts = posts.filter(
          (post) => new Date(post.createdAt) > new Date(lastCheckTime),
        );

        console.log("🔥 [NewPost] New posts count:", newPosts.length);

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
      console.log("🔥 [NewPost] Tab visibility changed, is active:", isActive);
      setIsTabActive(isActive);

      if (isActive) {
        // タブがアクティブになったときは常に新ポストをチェック
        console.log("🔥 [NewPost] Tab became active, checking for new posts");
        setTimeout(() => {
          checkForNewPosts();
        }, 500); // 少し遅延させてページの復帰を確実にする
      }
    };

    // ページロード時とフォーカス時にもチェック
    const handleFocus = () => {
      console.log("🔥 [NewPost] Window focused");
      setTimeout(() => {
        checkForNewPosts();
      }, 500);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkForNewPosts]);

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
    queryClient.invalidateQueries({ queryKey: ["posts"] });

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
