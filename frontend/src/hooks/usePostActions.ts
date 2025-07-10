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
      const newLikeCount = post.likes?.length || 0;

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

      // React Queryキャッシュを無効化してリアルタイム更新
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });

      // 特定の投稿のキャッシュも無効化
      queryClient.invalidateQueries({
        queryKey: ["post", post.id],
      });

      // ユーザーのいいね投稿一覧も無効化（プロフィールのいいねタブ用）
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
