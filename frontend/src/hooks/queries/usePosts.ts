import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PostsApi } from "@/api";
import type { Post } from "@/api";

export type PostWithUser = Post & {
  user: {
    id: string;
    name: string;
    image?: string;
  };
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
    staleTime: 30 * 1000, // 30秒間はフレッシュとみなす
  });
};

// ユーザー別投稿取得
export const usePostsByUser = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.postsByUser(userId),
    queryFn: () => PostsApi.getPostsByUser(userId),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1分間はフレッシュとみなす
  });
};

// 単一投稿取得
export const usePost = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.post(id),
    queryFn: () => PostsApi.getPostById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2分間はフレッシュとみなす
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

// いいねした投稿取得
export const useLikedPosts = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.likedPosts(userId),
    queryFn: () => PostsApi.getLikedPosts(userId),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1分間はフレッシュとみなす
  });
};

// 投稿作成ミューテーション
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      content: string;
      images: File[];
      replyToId?: number;
    }) => {
      const formData = new FormData();
      formData.append("content", data.content);

      if (data.replyToId) {
        formData.append("replyToId", data.replyToId.toString());
      }

      data.images.forEach((file) => {
        formData.append("images", file);
      });

      return PostsApi.createPostWithImages(formData);
    },
    onSuccess: (newPost) => {
      // 投稿一覧のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts });

      // リプライの場合は親投稿のキャッシュも無効化
      if (newPost.replyToId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.post(newPost.replyToId),
        });
      }
    },
  });
};

// 投稿削除ミューテーション
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => PostsApi.deletePost(postId),
    onSuccess: (_, postId) => {
      // 該当投稿のキャッシュを削除
      queryClient.removeQueries({ queryKey: QUERY_KEYS.post(postId) });

      // 投稿一覧のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts });
    },
  });
};

// いいねミューテーション
export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => PostsApi.likePost(postId),
    onSuccess: (_, postId) => {
      // 該当投稿のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.post(postId) });

      // 投稿一覧のキャッシュを無効化（いいね数が変わるため）
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts });
    },
  });
};
