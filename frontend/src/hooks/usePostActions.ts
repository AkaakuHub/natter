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

    if (isLiking || !currentUserId || !post) return;

    try {
      setIsLiking(true);
      const response = await PostsApi.likePost(post.id, currentUserId);

      setIsLiked(response.liked);
      setLikeCount((prev) => (response.liked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Failed to like post:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleReplyClick = () => {
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