import React from "react";
import { formatDate } from "@/utils/postUtils";
import { Post } from "@/api/types";
import { useAuthStore } from "@/stores/authStore";
import PostOwnerActions from "./PostOwnerActions";

interface PostHeaderProps {
  user: {
    id: string;
    name: string;
    image: string;
  };
  post: Post;
  createdAt: string;
  onUserClick: () => void;
  onPostUpdate?: (updatedPost: Post) => void;
  onPostDelete?: () => void;
}

const PostHeader = ({ 
  user, 
  post, 
  createdAt, 
  onUserClick, 
  onPostUpdate, 
  onPostDelete 
}: PostHeaderProps) => {
  const { user: currentUser } = useAuthStore();
  const isOwner = currentUser?.id === post.authorId;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <button
            className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-base"
            onClick={(e) => {
              e.stopPropagation();
              onUserClick();
            }}
          >
            {user?.name || "Unknown User"}
          </button>
          <span className="text-sm text-gray-500">@{user?.id || "unknown"}</span>
        </div>
        
        {/* 所有者の場合のみアクションメニューを表示 */}
        {isOwner && (
          <PostOwnerActions
            post={post}
            onPostUpdate={onPostUpdate}
            onPostDelete={onPostDelete}
          />
        )}
      </div>
      <time className="text-xs text-gray-400 block">
        {formatDate(createdAt)}
      </time>
    </div>
  );
};

export default PostHeader;
