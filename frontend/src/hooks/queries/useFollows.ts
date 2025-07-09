import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FollowsApi } from "@/api";

// クエリキー
const FOLLOW_QUERY_KEYS = {
  following: (userId: string) => ["follows", "following", userId] as const,
  followers: (userId: string) => ["follows", "followers", userId] as const,
  followStatus: (followerId: string, followingId: string) =>
    ["follows", "status", followerId, followingId] as const,
} as const;

// フォロー中ユーザー取得
export const useFollowing = (userId: string) => {
  return useQuery({
    queryKey: FOLLOW_QUERY_KEYS.following(userId),
    queryFn: () => FollowsApi.getFollowing(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2分間はフレッシュとみなす
  });
};

// フォロワー取得
export const useFollowers = (userId: string) => {
  return useQuery({
    queryKey: FOLLOW_QUERY_KEYS.followers(userId),
    queryFn: () => FollowsApi.getFollowers(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2分間はフレッシュとみなす
  });
};

// フォロー状態取得
export const useFollowStatus = (followerId: string, followingId: string) => {
  return useQuery({
    queryKey: FOLLOW_QUERY_KEYS.followStatus(followerId, followingId),
    queryFn: () => FollowsApi.getFollowStatus(followingId),
    enabled: !!followerId && !!followingId && followerId !== followingId,
    staleTime: 60 * 1000, // 1分間はフレッシュとみなす
  });
};

// フォローミューテーション
export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => FollowsApi.followUser(userId),
    onSuccess: () => {
      // フォロー関連のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ["follows"],
      });
    },
  });
};

// アンフォローミューテーション
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => FollowsApi.unfollowUser(userId),
    onSuccess: () => {
      // フォロー関連のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ["follows"],
      });
    },
  });
};
