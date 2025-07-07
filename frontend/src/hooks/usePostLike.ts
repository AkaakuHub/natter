import { useState, useEffect } from "react";
import { PostsApi } from "@/api";

interface UsePostLikeResult {
  isLiked: boolean;
  likeCount: number;
  isLiking: boolean;
  handleLike: (e: React.MouseEvent) => Promise<void>;
}

export const usePostLike = (
  postId: number,
  liked?: string[],
  currentUserId?: string,
): UsePostLikeResult => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    setIsLiked(currentUserId ? liked?.includes(currentUserId) || false : false);
    setLikeCount(liked?.length || 0);
  }, [liked, currentUserId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLiking || !currentUserId) return;

    try {
      setIsLiking(true);
      const response = await PostsApi.likePost(postId);

      setIsLiked(response.liked);
      setLikeCount((prev) => (response.liked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Failed to like post:", error);
    } finally {
      setIsLiking(false);
    }
  };

  return {
    isLiked,
    likeCount,
    isLiking,
    handleLike,
  };
};
