import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UsersApi } from "@/api";

// クエリキー
export const USER_QUERY_KEYS = {
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

// ユーザー更新ミューテーション
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: { name?: string; image?: string };
    }) => UsersApi.updateUser(userId, data),
    onSuccess: (updatedUser, { userId }) => {
      // 該当ユーザーのキャッシュを更新
      queryClient.setQueryData(USER_QUERY_KEYS.user(userId), updatedUser);

      // おすすめユーザーのキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEYS.recommendedUsers,
      });
    },
  });
};
