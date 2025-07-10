import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PostsApi, Post } from "@/api";

interface UsePostActionsResult {
  isLiked: boolean;
  likeCount: number;
  isLiking: boolean;
  handleLike: (e: React.MouseEvent) => Promise<void>;
  showReplyModal: boolean;
  setShowReplyModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleReplyClick: () => void;
}

export const usePostActions = (
  post: Post | null,
  currentUserId?: string,
  onPostUpdate?: () => void,
): UsePostActionsResult => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const queryClient = useQueryClient();

  // 投稿データの変更に対応して状態を更新
  useEffect(() => {
    if (post) {
      const newIsLiked =
        currentUserId && post.likes
          ? post.likes.some((like) => like.userId === currentUserId)
          : false;
      // _count.likesを優先し、フォールバックとしてlikes配列の長さを使用
      const newLikeCount = post._count?.likes ?? post.likes?.length ?? 0;

      setIsLiked(newIsLiked);
      setLikeCount(newLikeCount);
    }
  }, [post, currentUserId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 認証されていない場合はアラートを表示
    if (!currentUserId) {
      console.log("❌ No current user");
      alert("いいねするにはログインが必要です。");
      return;
    }

    if (isLiking || !post) {
      console.log("❌ Early return:", {
        isLiking,
        post: post ? "exists" : "null",
      });
      return;
    }

    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    try {
      setIsLiking(true);
      // 楽観的更新
      setIsLiked(!previousIsLiked);
      setLikeCount(
        previousIsLiked ? previousLikeCount - 1 : previousLikeCount + 1,
      );

      const response = await PostsApi.likePost(post.id);

      // API応答で状態を確定
      setIsLiked(response.liked);
      setLikeCount(
        response.liked ? previousLikeCount + 1 : previousLikeCount - 1,
      );

      // キャッシュデータを直接更新
      const updatePostInCache = (cachedPost: Post) => {
        if (cachedPost.id === post.id) {
          const currentLikeCount =
            cachedPost._count?.likes ?? cachedPost.likes?.length ?? 0;
          const newLikeCount = response.liked
            ? currentLikeCount + 1
            : currentLikeCount - 1;

          return {
            ...cachedPost,
            likes: response.liked
              ? [
                  ...(cachedPost.likes || []).filter(
                    (like) => like.userId !== currentUserId,
                  ),
                  { userId: currentUserId, user: { id: currentUserId } },
                ]
              : (cachedPost.likes || []).filter(
                  (like) => like.userId !== currentUserId,
                ),
            _count: {
              ...cachedPost._count,
              likes: Math.max(0, newLikeCount), // 負の値を防ぐ
            },
          };
        }
        return cachedPost;
      };

      // タイムライン投稿一覧のキャッシュを更新
      queryClient.setQueryData(["posts"], (oldData: Post[] | undefined) => {
        if (oldData) {
          return oldData.map(updatePostInCache);
        }
        return oldData;
      });

      // トレンディング投稿のキャッシュを更新
      queryClient.setQueryData(
        ["posts", "trending"],
        (oldData: Post[] | undefined) => {
          if (oldData) {
            return oldData.map(updatePostInCache);
          }
          return oldData;
        },
      );

      // ユーザー投稿一覧のキャッシュを更新
      queryClient.setQueryData(
        ["posts", "user", post.authorId],
        (oldData: Post[] | undefined) => {
          if (oldData) {
            return oldData.map(updatePostInCache);
          }
          return oldData;
        },
      );

      // メディア投稿一覧のキャッシュを更新
      queryClient.setQueryData(
        ["posts", "media"],
        (oldData: Post[] | undefined) => {
          if (oldData) {
            return oldData.map(updatePostInCache);
          }
          return oldData;
        },
      );

      // 特定の投稿のキャッシュを更新
      queryClient.setQueryData(
        ["post", post.id],
        (oldData: Post | undefined) => {
          if (oldData) {
            return updatePostInCache(oldData);
          }
          return oldData;
        },
      );

      // いいね投稿一覧のキャッシュを無効化（構造が異なるため）
      if (currentUserId) {
        queryClient.invalidateQueries({
          queryKey: ["posts", "liked", currentUserId],
        });
      }

      // 投稿データを更新
      if (onPostUpdate) {
        console.log("🔄 Calling onPostUpdate");
        onPostUpdate();
      }
    } catch (error) {
      // エラー時は元の状態に戻す
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
      console.error("❌ Failed to like post (usePostActions):", error);
      if (error instanceof Error && error.message.includes("Authentication")) {
        alert("認証エラー: ログインし直してください。");
      } else {
        alert("いいねに失敗しました。");
      }
    } finally {
      setIsLiking(false);
    }
  };

  const handleReplyClick = () => {
    // 認証されていない場合はアラートを表示
    if (!currentUserId) {
      console.log("❌ No current user for reply");
      return;
    }
    console.log("✅ User authenticated, opening reply modal");
    setShowReplyModal(true);
  };

  return {
    isLiked,
    likeCount,
    isLiking,
    handleLike,
    showReplyModal,
    setShowReplyModal,
    handleReplyClick,
  };
};
