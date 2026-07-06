"use client";

import React from "react";
import { IconArrowUp, IconBell } from "@tabler/icons-react";
import { useNewPostNotification } from "@/hooks/useNewPostNotification";

const NewPostBanner = () => {
  const { hasNewPosts, newPostCount, handleNewPostClick } =
    useNewPostNotification();

  if (!hasNewPosts) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-interactive text-text-inverse shadow-md animate-slide-down">
      <div className="max-w-md mx-auto px-4 py-3">
        <button
          onClick={handleNewPostClick}
          className="w-full flex items-center justify-center gap-2 rounded-md p-2 transition-colors hover:bg-interactive-hover"
        >
          <IconBell size={18} className="animate-pulse" />
          <span className="font-medium">
            {newPostCount === 1
              ? "新しい投稿があります"
              : `${newPostCount}件の新しい投稿があります`}
          </span>
          <IconArrowUp size={18} />
        </button>
      </div>
    </div>
  );
};

export default NewPostBanner;
