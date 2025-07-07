import { useState, useEffect } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import { useToast } from "@/hooks/useToast";
import { User } from "@/api";
import { ApiClient } from "@/api/client";
import { getSession } from "next-auth/react";

interface UsePostReplyResult {
  replyCount: number;
  showReplyModal: boolean;
  setShowReplyModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleReplyClick: (e: React.MouseEvent) => void;
  handleReplySubmit: (content: string, images: File[]) => Promise<void>;
}

export const usePostReply = (
  postId: number,
  initialReplyCount?: number,
  currentUser?: User | null,
): UsePostReplyResult => {
  const { navigateToPost } = useNavigation();
  const { showToast } = useToast();
  const [replyCount, setReplyCount] = useState(0);
  const [showReplyModal, setShowReplyModal] = useState(false);

  useEffect(() => {
    setReplyCount(initialReplyCount || 0);
  }, [initialReplyCount]);

  const handleReplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowReplyModal(true);
  };

  const handleReplySubmit = async (content: string, images: File[]) => {
    if (!currentUser) {
      showToast("認証が必要です。", "error");
      return;
    }

    try {
      // セッション確認
      const session = await getSession();
      if (!session || !session.user) {
        showToast("ログインが必要です。", "error");
        return;
      }

      const formData = new FormData();
      formData.append("content", content);
      formData.append("replyToId", postId.toString());

      images.forEach((file) => {
        formData.append("images", file);
      });

      console.log("Submitting reply with session user:", session.user.id);

      // ApiClient を使用して認証ヘッダー付きでリクエスト
      const newReply = await ApiClient.postFormData("/posts", formData);

      setReplyCount((prev) => prev + 1);

      showToast("リプライをしました。", "success", 3000, () => {
        navigateToPost(newReply.id);
      });
    } catch (error) {
      console.error("Reply submission error:", error);
      if (error instanceof Error) {
        if (error.message.includes("Authentication")) {
          showToast("認証エラー: ログインし直してください。", "error");
        } else {
          showToast(`リプライの投稿に失敗しました: ${error.message}`, "error");
        }
      } else {
        showToast("リプライの投稿に失敗しました。", "error");
      }
      throw error;
    }
  };

  return {
    replyCount,
    showReplyModal,
    setShowReplyModal,
    handleReplyClick,
    handleReplySubmit,
  };
};
