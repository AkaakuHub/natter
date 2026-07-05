"use client";

import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { QUERY_KEYS } from "@/hooks/queries/usePosts";
import { parsePostCreatedEvent } from "@/hooks/realtimePostEvent";

interface NewPostNotificationState {
  hasNewPosts: boolean;
  newPostCount: number;
}

export const useNewPostNotification = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();
  const [state, setState] = useState<NewPostNotificationState>({
    hasNewPosts: false,
    newPostCount: 0,
  });
  const [isTabActive, setIsTabActive] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const eventSource = new EventSource("/api/backend/events", {
      withCredentials: true,
    });

    const handlePostCreated = (event: MessageEvent<string>) => {
      const data = parsePostCreatedEvent(event.data);
      if (!data) {
        return;
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts });
      void queryClient.refetchQueries({
        queryKey: QUERY_KEYS.posts,
        type: "active",
      });
      if (data.authorId === currentUser?.id) {
        return;
      }

      setState((prev) => ({
        hasNewPosts: true,
        newPostCount: prev.newPostCount + 1,
      }));

      if (
        !isTabActive &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("Natter", {
          body: "新しい投稿があります",
          icon: "/icon.png",
          tag: "new-posts",
        });
      }
    };

    eventSource.addEventListener("post-created", handlePostCreated);
    return () => {
      eventSource.removeEventListener("post-created", handlePostCreated);
      eventSource.close();
    };
  }, [currentUser?.id, isTabActive, queryClient]);

  const handleNewPostClick = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts });
    void queryClient.refetchQueries({
      queryKey: QUERY_KEYS.posts,
      type: "active",
    });

    setState({
      hasNewPosts: false,
      newPostCount: 0,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    const scrollContainer = document.querySelector("[data-scroll-container]");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [queryClient]);

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  return {
    hasNewPosts: state.hasNewPosts,
    newPostCount: state.newPostCount,
    isTabActive,
    handleNewPostClick,
  };
};
