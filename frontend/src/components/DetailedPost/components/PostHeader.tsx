import React from "react";
import Image from "next/image";
import { formatDate } from "@/utils/postUtils";
import { Post } from "@/api/types";
import PostOwnerActions from "@/components/Post/components/PostOwnerActions";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface PostHeaderProps {
  user?: {
    id?: string;
    name?: string;
    image?: string;
  };
  createdAt: string | number | Date;
  onUserClick: () => void;
  post?: Post;
  onPostUpdate?: (updatedPost: Post) => void;
  onPostDelete?: () => void;
}

const PostHeader = ({
  user,
  createdAt,
  onUserClick,
  post,
  onPostUpdate,
  onPostDelete,
}: PostHeaderProps) => {
  const { currentUser } = useCurrentUser();
  const canShowActions = post && currentUser?.id === post.authorId;

  return (
    <div className="p-6 border-b border-border/60">
      <div className="flex items-start space-x-4">
        <button onClick={onUserClick} className="flex-shrink-0">
          <Image
            src={user?.image || "/no_avatar_image_128x128.png"}
            alt={`${user?.name}'s avatar`}
            width={56}
            height={56}
            className="rounded-full ring-2 ring-border hover:ring-interactive/30 transition-all duration-300 hover:scale-105"
          />
        </button>
        <div className="flex-1 min-w-0">
          <button onClick={onUserClick} className="hover:underline block mb-1">
            <h1 className="font-bold text-xl text-text hover:text-interactive transition-colors duration-300">
              {user?.name}
            </h1>
          </button>
          <p className="text-text-muted text-sm mb-2">@{user?.id}</p>
          <time className="text-xs text-text-muted">
            {formatDate(
              post?.updatedAt && post.updatedAt !== post.createdAt
                ? post.updatedAt
                : createdAt,
            )}
            {post?.updatedAt && post.updatedAt !== post.createdAt && (
              <span className="ml-1 text-text-muted">(編集済み)</span>
            )}
          </time>
        </div>
        {canShowActions && post && (
          <PostOwnerActions
            post={post}
            onPostUpdate={onPostUpdate}
            onPostDelete={onPostDelete}
          />
        )}
      </div>
    </div>
  );
};

export default PostHeader;
