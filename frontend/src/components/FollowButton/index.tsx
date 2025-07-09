"use client";

import React from "react";
import { IconUserPlus, IconUserMinus } from "@tabler/icons-react";
import { useToast } from "@/hooks/useToast";
import {
  useFollowStatus,
  useFollowUser,
  useUnfollowUser,
} from "@/hooks/queries/useFollows";

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
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
          isFollowing
            ? "bg-error text-text-inverse hover:bg-error/90"
            : "bg-interactive text-text-inverse hover:bg-interactive-hover"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isFollowing ? <IconUserMinus size={16} /> : <IconUserPlus size={16} />}
      </button>
    );
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isFollowing
          ? "bg-error text-text-inverse hover:bg-error/90"
          : "bg-interactive text-text-inverse hover:bg-interactive-hover"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
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
