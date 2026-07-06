import React from "react";
import { IconHeart, IconMessageCircle, IconShare } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ui } from "@/styles/ui";

interface PostActionsProps {
  isLiked: boolean;
  likeCount: number;
  isLiking: boolean;
  replyCount: number;
  onLike: (e: React.MouseEvent) => void;
  onReply: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  canInteract: boolean;
}

const PostActions = ({
  isLiked,
  likeCount,
  isLiking,
  replyCount,
  onLike,
  onReply,
  onShare,
  canInteract,
}: PostActionsProps) => {
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-muted">
      <div className="flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike(e);
          }}
          disabled={isLiking || !canInteract}
          className={cn(
            ui.button.action,
            isLiked
              ? "text-error bg-error-bg hover:bg-error-hover"
              : "hover:text-error hover:bg-error-bg",
          )}
        >
          <IconHeart
            size={18}
            fill={isLiked ? "currentColor" : "none"}
            className="transition-colors duration-200"
          />
          <span className="font-medium text-sm">{likeCount}</span>
        </button>

        <button
          onClick={
            canInteract
              ? (e) => {
                  e.stopPropagation();
                  onReply(e);
                }
              : undefined
          }
          disabled={!canInteract}
          className={cn(
            ui.button.action,
            canInteract
              ? "hover:text-text hover:bg-surface-hover"
              : "opacity-50 cursor-not-allowed",
          )}
        >
          <IconMessageCircle size={18} />
          <span className="font-medium text-sm">{replyCount}</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare(e);
          }}
          className={`${ui.button.action} hover:text-success hover:bg-success-bg`}
        >
          <IconShare size={18} />
          <span className="font-medium text-sm">共有</span>
        </button>
      </div>
    </div>
  );
};

export default PostActions;
