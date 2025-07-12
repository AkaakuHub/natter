import React from "react";
import {
  IconHeart,
  IconMessageCircle,
  IconShare,
  IconLogin,
} from "@tabler/icons-react";
import { useNavigation } from "@/hooks/useNavigation";

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
  const navigation = useNavigation();

  const handleLoginClick = () => {
    navigation.navigateToLogin();
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
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-interactive text-text-inverse rounded-full transition-all duration-300 hover:scale-105 hover:bg-interactive-hover"
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
          className={`flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-300 hover:scale-105 ${
            isLiked
              ? "text-error bg-error-bg hover:bg-error-hover"
              : "text-text-muted hover:text-error hover:bg-error-bg"
          } ${isLiking || !canInteract ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <IconHeart size={20} fill={isLiked ? "currentColor" : "none"} />
          <span className="font-medium">{likeCount}</span>
        </button>

        <button
          onClick={canInteract ? onReply : undefined}
          disabled={!canInteract}
          className={`flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-300 ${
            canInteract
              ? "text-text-muted hover:text-interactive hover:bg-interactive-bg hover:scale-105"
              : "text-text-muted opacity-50 cursor-not-allowed"
          }`}
        >
          <IconMessageCircle size={20} />
          <span className="font-medium">{repliesCount}</span>
        </button>

        <button
          onClick={onShare}
          className="flex items-center gap-2 px-4 py-3 rounded-full text-text-muted hover:text-success hover:bg-success-bg transition-all duration-300 hover:scale-105"
        >
          <IconShare size={20} />
          <span className="font-medium">共有</span>
        </button>
      </div>
    </div>
  );
};

export default PostActions;
