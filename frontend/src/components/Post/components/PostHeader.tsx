import React from "react";
import { formatDate } from "@/utils/postUtils";
import { Post } from "@/api/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";
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
  onPostDelete,
}: PostHeaderProps) => {
  const { currentUser } = useCurrentUser();
  const isOwner = currentUser?.id === (post.authorId || post.author?.id);

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col items-start">
          <button
            className="font-bold text-text hover:text-interactive transition-colors text-base"
            onClick={(e) => {
              e.stopPropagation();
              onUserClick();
            }}
          >
            {user?.name || "Unknown User"}
          </button>
          <span className="text-sm text-text-muted">
            @{user?.id || "unknown"}
          </span>
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
      <time className="text-xs text-text-muted block">
        {formatDate(
          post.updatedAt && post.updatedAt !== post.createdAt
            ? post.updatedAt
            : createdAt,
        )}
        {post.updatedAt && post.updatedAt !== post.createdAt && (
          <span className="ml-1 text-text-muted">(編集済み)</span>
        )}
      </time>
    </div>
  );
};

export default PostHeader;
