import React from "react";
import {
  IconHeart,
  IconMessageCircle,
  IconShare,
  IconLogin,
} from "@tabler/icons-react";
import { useSPANavigation } from "@/core/spa";
import { cn } from "@/lib/utils";
import { ui } from "@/styles/ui";

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
  const { navigateToLogin } = useSPANavigation();

  const handleLoginClick = () => {
    navigateToLogin();
  };

  if (!canInteract) {
    return (
      <div className="px-6 py-4 border-t border-border/60 bg-surface-variant/30">
        <div className="text-center">
          <p className="text-text-muted text-sm mb-4">
            いいねや返信をするにはログインしてください
          </p>
          <button
            onClick={handleLoginClick}
            className={`${ui.button.primary} mx-auto`}
          >
            <IconLogin size={20} />
            <span className="font-medium">ログイン</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 border-t border-border/60 bg-surface-variant/30">
      <div className="flex items-center justify-around">
        <button
          onClick={onLike}
          disabled={isLiking || !canInteract}
          className={cn(
            ui.button.action,
            isLiked
              ? "text-error bg-error-bg hover:bg-error-hover"
              : "hover:text-error hover:bg-error-bg",
          )}
        >
          <IconHeart size={20} fill={isLiked ? "currentColor" : "none"} />
          <span className="font-medium">{likeCount}</span>
        </button>

        <button
          onClick={canInteract ? onReply : undefined}
          disabled={!canInteract}
          className={cn(
            ui.button.action,
            canInteract
              ? "hover:text-text hover:bg-surface-hover"
              : "opacity-50 cursor-not-allowed",
          )}
        >
          <IconMessageCircle size={20} />
          <span className="font-medium">{repliesCount}</span>
        </button>

        <button
          onClick={onShare}
          className={`${ui.button.action} hover:text-success hover:bg-success-bg`}
        >
          <IconShare size={20} />
          <span className="font-medium">共有</span>
        </button>
      </div>
    </div>
  );
};

export default PostActions;
