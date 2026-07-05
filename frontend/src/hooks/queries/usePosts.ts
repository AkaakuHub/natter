import { useQuery } from "@tanstack/react-query";
import { PostsApi } from "@/api";
import type { Post } from "@/api";

export type PostWithUser = Post & {
  user: {
    id: string;
    name: string;
    image?: string;
  };
  likesCount?: number;
  isLiked?: boolean;
};

// クエリキー
export const QUERY_KEYS = {
  posts: ["posts"] as const,
  postsByUser: (userId: string) => ["posts", "user", userId] as const,
  post: (id: number) => ["post", id] as const,
  trendingPosts: ["posts", "trending"] as const,
  likedPosts: (userId: string) => ["posts", "liked", userId] as const,
} as const;

// 全投稿取得
export const usePosts = () => {
  return useQuery({
    queryKey: QUERY_KEYS.posts,
    queryFn: () => PostsApi.getAllPosts(),
    staleTime: 0, // 常に最新データを取得
    refetchOnWindowFocus: true, // ウィンドウフォーカス時に再取得
    refetchOnMount: true, // マウント時に再取得
  });
};

// トレンド投稿取得
export const useTrendingPosts = () => {
  return useQuery({
    queryKey: QUERY_KEYS.trendingPosts,
    queryFn: () => PostsApi.getTrendingPosts(),
    staleTime: 5 * 60 * 1000, // 5分間はフレッシュとみなす
  });
};
