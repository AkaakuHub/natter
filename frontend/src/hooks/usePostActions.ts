import { useState, useEffect } from "react";
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

  // 投稿データの変更に対応して状態を更新
  useEffect(() => {
    if (post) {
      const newIsLiked =
        currentUserId && post.likes
          ? post.likes.some((like) => like.userId === currentUserId)
          : false;
      const newLikeCount = post.likes?.length || 0;

      console.log("🔄 usePostActions useEffect:", {
        postId: post.id,
        currentUserId,
        likes: post.likes?.length || 0,
        newIsLiked,
        newLikeCount,
      });

      setIsLiked(newIsLiked);
      setLikeCount(newLikeCount);
    }
  }, [post, currentUserId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("🎯 usePostActions handleLike called", {
      postId: post?.id,
      currentUserId,
      isLiking,
      post: post ? "exists" : "null",
    });

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

    console.log("📊 Before like (usePostActions):", {
      previousIsLiked,
      previousLikeCount,
      postId: post.id,
    });

    try {
      setIsLiking(true);
      // 楽観的更新
      setIsLiked(!previousIsLiked);
      setLikeCount(
        previousIsLiked ? previousLikeCount - 1 : previousLikeCount + 1,
      );

      console.log("🚀 Making API call to like post (usePostActions):", post.id);
      const response = await PostsApi.likePost(post.id);
      console.log("✅ API response (usePostActions):", response);

      // API応答で状態を確定
      setIsLiked(response.liked);
      setLikeCount(
        response.liked ? previousLikeCount + 1 : previousLikeCount - 1,
      );

      console.log("🔄 Final state (usePostActions):", {
        isLiked: response.liked,
        likeCount: response.liked
          ? previousLikeCount + 1
          : previousLikeCount - 1,
      });

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
