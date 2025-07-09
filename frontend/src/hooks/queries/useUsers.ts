import { useQuery } from "@tanstack/react-query";
import { UsersApi } from "@/api";

// クエリキー
const USER_QUERY_KEYS = {
  users: ["users"] as const,
  user: (id: string) => ["user", id] as const,
  recommendedUsers: ["users", "recommended"] as const,
} as const;

// ユーザー情報取得
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.user(userId),
    queryFn: () => UsersApi.getUserById(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5分間はフレッシュとみなす
  });
};

// おすすめユーザー取得
export const useRecommendedUsers = (limit: number = 5) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.recommendedUsers,
    queryFn: () => UsersApi.getRecommendedUsers(limit),
    staleTime: 10 * 60 * 1000, // 10分間はフレッシュとみなす
  });
};
