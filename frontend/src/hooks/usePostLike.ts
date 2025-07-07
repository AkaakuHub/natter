import { useState, useEffect } from "react";
import { PostsApi } from "@/api";
import { Like } from "@/api/types";

interface UsePostLikeResult {
  isLiked: boolean;
  likeCount: number;
  isLiking: boolean;
  handleLike: (e: React.MouseEvent) => Promise<void>;
}

export const usePostLike = (
  postId: number,
  liked?: Like[],
  currentUserId?: string,
  onLikeUpdate?: () => void,
): UsePostLikeResult => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const newIsLiked = currentUserId
      ? liked?.some((like) => like.userId === currentUserId) || false
      : false;
    const newLikeCount = liked?.length || 0;

    console.log("🔄 usePostLike useEffect:", {
      postId,
      currentUserId,
      liked: liked?.length || 0,
      newIsLiked,
      newLikeCount,
    });

    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);
  }, [liked, currentUserId, postId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("🎯 handleLike called", { postId, currentUserId, isLiking });

    if (isLiking || !currentUserId) {
      console.log("❌ Early return:", { isLiking, currentUserId });
      return;
    }

    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    console.log("📊 Before like:", {
      previousIsLiked,
      previousLikeCount,
      postId,
    });

    try {
      setIsLiking(true);
      // 楽観的更新
      setIsLiked(!previousIsLiked);
      setLikeCount(
        previousIsLiked ? previousLikeCount - 1 : previousLikeCount + 1,
      );

      console.log("🚀 Making API call to like post:", postId);
      const response = await PostsApi.likePost(postId);
      console.log("✅ API response:", response);

      // API応答で状態を確定（楽観的更新が正しければそのまま）
      if (response.liked !== !previousIsLiked) {
        console.log("🔄 Correcting optimistic update:", {
          expected: !previousIsLiked,
          actual: response.liked,
        });
        setIsLiked(response.liked);
        setLikeCount(
          response.liked ? previousLikeCount + 1 : previousLikeCount - 1,
        );
      } else {
        console.log("✅ Optimistic update was correct");
      }

      // 上位コンポーネントに更新を通知
      if (onLikeUpdate) {
        onLikeUpdate();
      }
    } catch (error) {
      console.error("❌ Failed to like post:", error);
      // エラー時は元の状態に戻す
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
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
