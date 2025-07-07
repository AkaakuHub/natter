import React from "react";
import { IconHeart, IconMessageCircle, IconShare } from "@tabler/icons-react";

interface PostActionsProps {
  isLiked: boolean;
  likeCount: number;
  isLiking: boolean;
  replyCount: number;
  onLike: (e: React.MouseEvent) => void;
  onReply: (e: React.MouseEvent) => void;
  canInteract: boolean;
}

const PostActions = ({
  isLiked,
  likeCount,
  isLiking,
  replyCount,
  onLike,
  onReply,
  canInteract,
}: PostActionsProps) => {
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-muted">
      <div className="flex items-center gap-6">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike(e);
          }}
          disabled={isLiking || !canInteract}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-200 ${
            isLiked
              ? "text-error bg-error-bg hover:bg-error-hover"
              : "text-text-muted hover:text-error hover:bg-error-bg"
          } ${isLiking || !canInteract ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <IconHeart
            size={18}
            fill={isLiked ? "currentColor" : "none"}
            className="transition-colors duration-200"
          />
          <span className="font-medium text-sm">{likeCount}</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onReply(e);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-text-muted hover:text-interactive hover:bg-interactive-bg transition-colors duration-200"
        >
          <IconMessageCircle size={18} />
          <span className="font-medium text-sm">{replyCount}</span>
        </button>

        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-text-muted hover:text-success hover:bg-success-bg transition-colors duration-200"
        >
          <IconShare size={18} />
          <span className="font-medium text-sm">共有</span>
        </button>
      </div>
    </div>
  );
};

export default PostActions;
