"use client";

import React from "react";
import { IconUserPlus, IconUserMinus } from "@tabler/icons-react";
import { useToast } from "@/hooks/useToast";
import {
  useFollowStatus,
  useFollowUser,
  useUnfollowUser,
} from "@/hooks/queries/useFollows";
import { cn } from "@/lib/utils";
import { ui } from "@/styles/ui";

interface FollowButtonProps {
  userId: string;
  currentUserId?: string;
  onFollowChange?: (isFollowing: boolean) => void;
  compact?: boolean;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  currentUserId,
  onFollowChange,
  compact = false,
}) => {
  const { showToast } = useToast();

  // React Query hooks
  const { data: followStatus, isLoading: statusLoading } = useFollowStatus(
    currentUserId || "",
    userId,
  );
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  // 自分自身の場合は何も表示しない
  if (!currentUserId || currentUserId === userId) {
    return null;
  }

  const isFollowing = followStatus?.isFollowing ?? false;
  const loading =
    statusLoading || followMutation.isPending || unfollowMutation.isPending;

  const handleFollowToggle = async () => {
    if (loading) return;

    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync(userId);
        showToast("フォローを解除しました", "success");
        onFollowChange?.(false);
      } else {
        await followMutation.mutateAsync(userId);
        showToast("フォローしました", "success");
        onFollowChange?.(true);
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
      showToast("エラーが発生しました", "error");
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleFollowToggle}
        disabled={loading}
        className={cn(
          ui.button.icon,
          isFollowing
            ? "bg-error text-text-inverse hover:bg-error-hover hover:text-text-inverse"
            : "bg-interactive text-text-inverse hover:bg-interactive-hover hover:text-text-inverse",
        )}
      >
        {isFollowing ? <IconUserMinus size={16} /> : <IconUserPlus size={16} />}
      </button>
    );
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading}
      className={cn(isFollowing ? ui.button.danger : ui.button.primary)}
    >
      {isFollowing ? (
        <>
          <IconUserMinus size={16} />
          フォロー中
        </>
      ) : (
        <>
          <IconUserPlus size={16} />
          フォロー
        </>
      )}
    </button>
  );
};

export default FollowButton;
