"use client";

import React from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import { useFollowing, useFollowers } from "@/hooks/queries/useFollows";
import { useUser } from "@/hooks/queries/useUsers";
import OptimizedImage from "@/components/common/OptimizedImage";
import FollowButton from "@/components/FollowButton";
import SkeletonCard from "@/components/common/SkeletonCard";
import { ExtendedSession } from "@/types";
import { useSPANavigation } from "@/core/spa";
import { avatarImageUrl } from "@/utils/avatarImage";
import { ui } from "@/styles/ui";

interface FollowListProps {
  userId: string;
  type: "following" | "followers";
  session?: ExtendedSession | null;
}

interface FollowListHeaderProps {
  title: string;
  detail?: string;
  showBackButton: boolean;
  onBack: () => void;
  loading?: boolean;
}

const FollowListHeader = ({
  title,
  detail,
  showBackButton,
  onBack,
  loading = false,
}: FollowListHeaderProps) => {
  return (
    <div className="sticky top-0 bg-surface/80 backdrop-blur-md border-b border-surface-variant z-10">
      <div className="flex items-center gap-3 p-4">
        {showBackButton && (
          <button onClick={onBack} className={ui.button.icon} title="戻る">
            <IconArrowLeft size={20} />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-text">{title}</h1>
          {loading ? (
            <div className="h-4 bg-surface-variant animate-pulse rounded w-32 mt-1"></div>
          ) : detail ? (
            <p className="text-sm text-text-muted">{detail}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const FollowList: React.FC<FollowListProps> = ({ userId, type, session }) => {
  const { navigateToProfile } = useSPANavigation();
  const { data: targetUser } = useUser(userId);

  const isOwnProfile = userId === session?.user?.id;

  const handleBackClick = () => {
    if (isOwnProfile) {
      navigateToProfile();
    } else {
      navigateToProfile(userId);
    }
  };

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
  const title = isFollowing ? "フォロー中" : "フォロワー";
  const data = isFollowing ? followingData : followersData;
  const loading = isFollowing ? followingLoading : followersLoading;
  const error = isFollowing ? followingError : followersError;

  const handleUserClick = (clickedUserId: string) => {
    navigateToProfile(clickedUserId);
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <FollowListHeader
          title={title}
          showBackButton={!!session}
          onBack={handleBackClick}
          loading={true}
        />

        <div className="p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto">
        <FollowListHeader
          title={title}
          showBackButton={!!session}
          onBack={handleBackClick}
        />

        <div className="p-4">
          <div className="text-center py-8">
            <p className="text-error">データの取得に失敗しました</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <FollowListHeader
        title={title}
        detail={`${targetUser?.name || "ユーザー"}の${title} (${data.length})`}
        showBackButton={!!session}
        onBack={handleBackClick}
      />

      <div className="p-4">
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
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-variant transition-colors bg-surface border border-surface-variant"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => handleUserClick(user.id)}
                >
                  <OptimizedImage
                    src={avatarImageUrl(user.image)}
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
                  <p className="text-base font-medium text-text break-words word-break-break-all whitespace-normal">
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
                    currentUserId={session?.user?.id}
                    compact={true}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowList;
