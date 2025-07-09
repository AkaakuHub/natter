"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FollowButton from "@/components/FollowButton";
import { useRecommendedUsers } from "@/hooks/queries/useUsers";

interface RecommendedUsersProps {
  currentUserId?: string;
}

const RecommendedUsers: React.FC<RecommendedUsersProps> = ({
  currentUserId,
}) => {
  const router = useRouter();
  const {
    data: recommendedUsers = [],
    isLoading: loading,
    error,
  } = useRecommendedUsers(5);

  // フロントエンド側でも自分を除外（バックエンドで除外されていない場合のフォールバック）
  const users = currentUserId
    ? recommendedUsers.filter((user) => user.id !== currentUserId)
    : recommendedUsers;

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="bg-surface-variant rounded-lg p-4">
        <h3 className="text-lg font-semibold text-text mb-4">
          おすすめユーザー
        </h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-surface rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-surface rounded mb-1"></div>
                <div className="h-3 bg-surface rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface-variant rounded-lg p-4">
        <h3 className="text-lg font-semibold text-text mb-4">
          おすすめユーザー
        </h3>
        <p className="text-error text-sm">
          おすすめユーザーの取得に失敗しました
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-variant rounded-lg p-4">
      <h3 className="text-lg font-semibold text-text mb-4">おすすめユーザー</h3>
      <div className="space-y-3">
        {users.length === 0 ? (
          <p className="text-text-muted text-sm">
            おすすめユーザーは見つかりませんでした
          </p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user.id)}
              className="flex items-center gap-3 cursor-pointer hover:bg-surface p-2 rounded-lg transition-colors"
            >
              <Image
                src={user.image || "/no_avatar_image_128x128.png"}
                alt={user.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {user.name}
                </p>
                <p className="text-xs text-text-muted">
                  {user._count?.posts || 0} 投稿
                </p>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <FollowButton
                  userId={user.id}
                  currentUserId={currentUserId}
                  compact={true}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecommendedUsers;
