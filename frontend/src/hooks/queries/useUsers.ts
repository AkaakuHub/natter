import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UsersApi } from "@/api";

// クエリキー
const USER_QUERY_KEYS = {
  users: ["users"] as const,
  user: (id: string) => ["user", id] as const,
  recommendedUsers: ["users", "recommended"] as const,
} as const;

// ユーザー情報取得
export const useUser = (userId: string) => {
  // デバッグ: useUserが呼ばれた場所を特定
  if (userId && userId !== "") {
    console.log(
      "🚨 [useUser] Called with userId:",
      userId,
      "type:",
      typeof userId,
    );
    // 数値っぽい場合は警告
    if (!isNaN(Number(userId)) && Number(userId) < 1000) {
      console.warn(
        "🚨 [useUser] SUSPICIOUS: userId looks like a Post ID:",
        userId,
      );
      console.log("🚨 [useUser] Stack trace:", new Error().stack);
    }
  }

  return useQuery({
    queryKey: USER_QUERY_KEYS.user(userId),
    queryFn: () => UsersApi.getUserById(userId),
    enabled: !!userId && userId !== "",
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
      data: { name: string };
    }) => UsersApi.updateUser(userId, data),
    onSuccess: (updatedUser) => {
      // 特定のユーザーキャッシュを更新
      queryClient.setQueryData(
        USER_QUERY_KEYS.user(updatedUser.id),
        updatedUser,
      );

      // 全てのユーザー関連キャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      // 投稿一覧のキャッシュも無効化（投稿者名が変わるため）
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });

      // NextAuthのセッション情報も更新が必要な場合があるため
      queryClient.invalidateQueries({
        queryKey: ["session"],
      });
    },
  });
};
