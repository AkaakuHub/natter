import React from "react";
import { IconHeart, IconMessageCircle, IconShare } from "@tabler/icons-react";

interface PostActionsProps {
  isLiked: boolean;
  likeCount: number;
  isLiking: boolean;
  repliesCount: number;
  onLike: (e: React.MouseEvent) => void;
  onReply: () => void;
  onShare: (e: React.MouseEvent) => void;
  canInteract: boolean;
}

const PostActions = ({
  isLiked,
  likeCount,
  isLiking,
  repliesCount,
  onLike,
  onReply,
  onShare,
  canInteract,
}: PostActionsProps) => {
  return (
    <div className="px-6 py-4 border-t border-border/60 bg-surface-variant/30">
      <div className="flex items-center justify-around">
        <button
          onClick={onLike}
          disabled={isLiking || !canInteract}
          className={`flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-300 hover:scale-105 ${
            isLiked
              ? "text-error bg-error-bg hover:bg-error-hover"
              : "text-text-muted hover:text-error hover:bg-error-bg"
          } ${isLiking || !canInteract ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <IconHeart
            size={20}
            fill={isLiked ? "currentColor" : "none"}
            className={isLiked ? "animate-pulse" : ""}
          />
          <span className="font-medium">{likeCount}</span>
        </button>

        <button
          onClick={onReply}
          className="flex items-center gap-2 px-4 py-3 rounded-full text-text-muted hover:text-interactive hover:bg-interactive-bg transition-all duration-300 hover:scale-105"
        >
          <IconMessageCircle size={20} />
          <span className="font-medium">{repliesCount}</span>
        </button>

        <button
          onClick={onShare}
          className="flex items-center gap-2 px-4 py-3 rounded-full text-text-muted hover:text-success hover:bg-success-bg transition-all duration-300 hover:scale-105"
        >
          <IconShare size={20} />
          <span className="font-medium">シェア</span>
        </button>
      </div>
    </div>
  );
};

export default PostActions;
