import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    staleTime: 0, // 常に最新データを取得
    refetchOnWindowFocus: true, // ウィンドウフォーカス時に再取得
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
      // 投稿一覧のキャッシュに新しい投稿を直接追加（楽観的更新）
      queryClient.setQueryData(
        QUERY_KEYS.posts,
        (oldPosts: PostWithUser[] | undefined) => {
          if (!oldPosts) return [newPost];
          return [newPost, ...oldPosts];
        },
      );

      // 投稿一覧のキャッシュを無効化して最新データを取得
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts });

      // ユーザー別投稿のキャッシュも更新
      if (newPost.author?.id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.postsByUser(newPost.author.id),
        });
      }

      // リプライの場合は親投稿のキャッシュも無効化
      if (newPost.replyToId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.post(newPost.replyToId),
        });
      }

      // トレンド投稿のキャッシュも更新
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trendingPosts });
    },
  });
};

// 投稿削除ミューテーション
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => PostsApi.deletePost(postId),
    onSuccess: (_, postId) => {
      // 投稿一覧のキャッシュから該当投稿を直接削除（楽観的更新）
      queryClient.setQueryData(
        QUERY_KEYS.posts,
        (oldPosts: PostWithUser[] | undefined) => {
          return oldPosts?.filter((post) => post.id !== postId) || [];
        },
      );

      // 該当投稿のキャッシュを削除
      queryClient.removeQueries({ queryKey: QUERY_KEYS.post(postId) });

      // 投稿一覧のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts });

      // 関連キャッシュも更新
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trendingPosts });
    },
  });
};

// いいねミューテーション
export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => PostsApi.likePost(postId),
    onMutate: async (postId) => {
      // 楽観的更新のために進行中のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.posts });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.post(postId) });

      // 現在のデータを取得（ロールバック用）
      const previousPosts = queryClient.getQueryData(QUERY_KEYS.posts);
      const previousPost = queryClient.getQueryData(QUERY_KEYS.post(postId));

      // 楽観的更新：投稿一覧のいいね数を即座に更新
      queryClient.setQueryData(
        QUERY_KEYS.posts,
        (oldPosts: PostWithUser[] | undefined) => {
          return oldPosts?.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                likesCount: (post.likesCount || 0) + 1,
                isLiked: true,
              };
            }
            return post;
          });
        },
      );

      // 楽観的更新：単一投稿のいいね数も更新
      queryClient.setQueryData(
        QUERY_KEYS.post(postId),
        (oldPost: PostWithUser | undefined) => {
          if (oldPost) {
            return {
              ...oldPost,
              likesCount: (oldPost.likesCount || 0) + 1,
              isLiked: true,
            };
          }
          return oldPost;
        },
      );

      return { previousPosts, previousPost };
    },
    onError: (err, postId, context) => {
      // エラー時はロールバック
      if (context?.previousPosts) {
        queryClient.setQueryData(QUERY_KEYS.posts, context.previousPosts);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(QUERY_KEYS.post(postId), context.previousPost);
      }
    },
    onSettled: (_, __, postId) => {
      // 最終的にサーバーから最新データを取得
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.post(postId) });
    },
  });
};
