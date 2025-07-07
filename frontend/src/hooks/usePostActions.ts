import { useState } from "react";
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
): UsePostActionsResult => {
  const [isLiked, setIsLiked] = useState(
    currentUserId && post?.likes
      ? post.likes.some((like) => like.userId === currentUserId)
      : false,
  );
  const [likeCount, setLikeCount] = useState(post?.likes?.length || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 認証されていない場合はアラートを表示
    if (!currentUserId) {
      alert("いいねするにはログインが必要です。");
      return;
    }

    if (isLiking || !post) return;

    try {
      setIsLiking(true);
      const response = await PostsApi.likePost(post.id);

      setIsLiked(response.liked);
      setLikeCount((prev) => (response.liked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Failed to like post:", error);
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
      alert("返信するにはログインが必要です。");
      return;
    }
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
