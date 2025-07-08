"use client";

import React, { useState, useEffect } from "react";
import { IconUserPlus } from "@tabler/icons-react";
import { UsersApi, User } from "@/api";
import { useRouter } from "next/navigation";

interface RecommendedUsersProps {
  currentUserId?: string;
}

const RecommendedUsers: React.FC<RecommendedUsersProps> = ({
  currentUserId,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRecommendedUsers = async () => {
      try {
        const recommendedUsers = await UsersApi.getRecommendedUsers(5);
        // フロントエンド側でも自分を除外（バックエンドで除外されていない場合のフォールバック）
        const filteredUsers = currentUserId
          ? recommendedUsers.filter((user) => user.id !== currentUserId)
          : recommendedUsers;
        setUsers(filteredUsers);
      } catch (err) {
        console.error("Failed to fetch recommended users:", err);
        setError("おすすめユーザーの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedUsers();
  }, [currentUserId]);

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
        <p className="text-error text-sm">{error}</p>
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
              <img
                src={user.image || "/no_avatar_image_128x128.png"}
                alt={user.name}
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // フォロー機能は今後実装
                  console.log("Follow user:", user.id);
                }}
                className="flex items-center justify-center w-8 h-8 bg-interactive hover:bg-interactive-hover text-text-inverse rounded-full transition-colors"
              >
                <IconUserPlus size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecommendedUsers;
