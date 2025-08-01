"use client";

import React from "react";
import Image from "next/image";
import { IconHeart, IconMessageCircle } from "@tabler/icons-react";
import { transformPostToPostComponent } from "@/utils/postTransformers";
import { useTrendingPosts } from "@/hooks/queries/usePosts";
import { useSPANavigation } from "@/core/spa";

const TrendingPosts: React.FC = () => {
  const { navigateToPost } = useSPANavigation();
  const { data: posts = [], isLoading: loading, error } = useTrendingPosts();

  const handlePostClick = (postId: number) => {
    navigateToPost(postId);
  };

  if (loading) {
    return (
      <div className="bg-surface-variant rounded-lg p-4">
        <h3 className="text-lg font-semibold text-text mb-4">人気の投稿</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-surface rounded mb-2"></div>
              <div className="h-3 bg-surface rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface-variant rounded-lg p-4">
        <h3 className="text-lg font-semibold text-text mb-4">人気の投稿</h3>
        <p className="text-error text-sm">人気投稿の取得に失敗しました</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-variant rounded-lg p-4">
      <h3 className="text-lg font-semibold text-text mb-4">人気の投稿</h3>
      <div className="space-y-3">
        {posts.map((post) => {
          const transformed = transformPostToPostComponent(post);
          if (!transformed) return null;

          const { transformedUser, transformedPost } = transformed;

          return (
            <div
              key={post.id}
              onClick={() => handlePostClick(post.id)}
              className="cursor-pointer hover:bg-surface p-3 rounded-lg transition-colors border border-border"
            >
              <div className="flex items-center gap-2 mb-2">
                <Image
                  src={transformedUser.image || "/no_avatar_image_128x128.png"}
                  alt={transformedUser.name}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm font-medium text-text break-words word-break-break-all whitespace-normal min-w-0 flex-1">
                  {transformedUser.name}
                </span>
              </div>

              <p className="text-sm text-text line-clamp-2 mb-2">
                {transformedPost.content}
              </p>

              <div className="flex items-center gap-4 text-xs text-text-muted">
                <div className="flex items-center gap-1">
                  <IconHeart size={14} />
                  <span>{post._count?.likes || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <IconMessageCircle size={14} />
                  <span>{post._count?.replies || 0}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingPosts;
