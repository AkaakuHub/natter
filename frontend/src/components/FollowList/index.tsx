"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useFollowing, useFollowers } from "@/hooks/queries/useFollows";
import { useUser } from "@/hooks/queries/useUsers";
import OptimizedImage from "@/components/common/OptimizedImage";
import FollowButton from "@/components/FollowButton";
import SkeletonCard from "@/components/common/SkeletonCard";
import { ExtendedSession } from "@/types";

interface FollowListProps {
  userId: string;
  type: "following" | "followers";
  session: ExtendedSession;
}

const FollowList: React.FC<FollowListProps> = ({ userId, type, session }) => {
  const router = useRouter();
  const { data: targetUser } = useUser(userId);

  const {
    data: followingData = [],
    isLoading: followingLoading,
    error: followingError,
  } = useFollowing(userId);
  const {
    data: followersData = [],
    isLoading: followersLoading,
    error: followersError,
  } = useFollowers(userId);

  const isFollowing = type === "following";
  const data = isFollowing ? followingData : followersData;
  const loading = isFollowing ? followingLoading : followersLoading;
  const error = isFollowing ? followingError : followersError;

  const handleUserClick = (clickedUserId: string) => {
    router.push(`/profile/${clickedUserId}`);
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-text mb-2">
            {isFollowing ? "フォロー中" : "フォロワー"}
          </h1>
          <div className="h-4 bg-surface-variant animate-pulse rounded w-32"></div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-text mb-2">
            {isFollowing ? "フォロー中" : "フォロワー"}
          </h1>
        </div>
        <div className="text-center py-8">
          <p className="text-error">データの取得に失敗しました</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text mb-2">
          {isFollowing ? "フォロー中" : "フォロワー"}
        </h1>
        <p className="text-text-muted">
          {targetUser?.name || "ユーザー"}の
          {isFollowing ? "フォロー中" : "フォロワー"} ({data.length})
        </p>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-muted">
            {isFollowing
              ? "フォロー中のユーザーはいません"
              : "フォロワーはいません"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-variant transition-colors"
            >
              <div
                className="cursor-pointer"
                onClick={() => handleUserClick(user.id)}
              >
                <OptimizedImage
                  src={user.image || "/no_avatar_image_128x128.png"}
                  alt={user.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full"
                />
              </div>

              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => handleUserClick(user.id)}
              >
                <p className="text-base font-medium text-text truncate">
                  {user.name}
                </p>
                <p className="text-sm text-text-muted">
                  {new Date(user.followedAt).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  {isFollowing ? "からフォロー中" : "からフォロワー"}
                </p>
              </div>

              <div className="flex-shrink-0">
                <FollowButton
                  userId={user.id}
                  currentUserId={session.user?.id}
                  compact={true}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowList;
