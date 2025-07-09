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

interface TimeLineProps {
  session?: ExtendedSession;
  currentUser?: User | null;
}

const TimeLine = ({ currentUser }: TimeLineProps) => {
  const { data: posts, isLoading, error } = usePosts();
  const queryClient = useQueryClient();

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

  // グローバルな投稿作成イベントを監視
  useEffect(() => {
    const handleGlobalPostCreated = () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts });
    };

    window.addEventListener("postCreated", handleGlobalPostCreated);
    return () => {
      window.removeEventListener("postCreated", handleGlobalPostCreated);
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
      <div className="w-full max-w-md mx-auto">
        {/* 投稿一覧 */}
        {posts?.map((post) => {
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
        })}
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
