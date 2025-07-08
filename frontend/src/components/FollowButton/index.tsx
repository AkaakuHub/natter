"use client";

import React, { useState, useEffect } from "react";
import { IconUserPlus, IconUserMinus } from "@tabler/icons-react";
import { FollowsApi } from "@/api";
import { useToast } from "@/hooks/useToast";

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
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const status = await FollowsApi.getFollowStatus(userId);
        setIsFollowing(status.isFollowing);
      } catch (error) {
        console.error("Failed to fetch follow status:", error);
      }
    };

    fetchFollowStatus();
  }, [userId]);

  // 自分自身の場合は何も表示しない
  if (!currentUserId || currentUserId === userId) {
    return null;
  }

  const handleFollowToggle = async () => {
    if (loading) return;

    try {
      setLoading(true);

      if (isFollowing) {
        await FollowsApi.unfollowUser(userId);
        setIsFollowing(false);
        showToast("フォローを解除しました", "success");
        onFollowChange?.(false);
      } else {
        await FollowsApi.followUser(userId);
        setIsFollowing(true);
        showToast("フォローしました", "success");
        onFollowChange?.(true);
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
      showToast("エラーが発生しました", "error");
    } finally {
      setLoading(false);
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
