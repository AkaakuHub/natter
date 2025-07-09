import { useState } from "react";
import { User } from "@/api";
import { useToast } from "@/hooks/useToast";
import { useNavigation } from "@/hooks/useNavigation";
import { ApiClient } from "@/api/client";
import { getSession } from "next-auth/react";

interface UsePostSubmitResult {
  isSubmitting: boolean;
  error: string | null;
  handleSubmit: (
    content: string,
    images: File[],
    replyToId?: number,
    characterId?: number,
  ) => Promise<void>;
  clearError: () => void;
}

export const usePostSubmit = (
  currentUser?: User | null,
  onPostCreated?: () => void,
): UsePostSubmitResult => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { navigateToPost } = useNavigation();

  const handleSubmit = async (
    content: string,
    images: File[],
    replyToId?: number,
    characterId?: number,
  ) => {
    if (!content.trim() && images.length === 0) {
      setError("投稿内容または画像を入力してください");
      return;
    }

    if (!currentUser) {
      setError("ユーザー情報が取得できません");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // セッション確認
      const session = await getSession();
      if (!session || !session.user) {
        setError("ログインが必要です");
        showToast("ログインが必要です。", "error");
        return;
      }

      console.log("Submitting post with session user:", session.user.id);

      const formData = new FormData();
      if (content.trim()) {
        formData.append("content", content.trim());
      }

      if (replyToId) {
        formData.append("replyToId", replyToId.toString());
      }

      if (characterId) {
        formData.append("characterId", characterId.toString());
      }

      images.forEach((file) => {
        formData.append("images", file);
      });

      // ApiClient を使用して認証ヘッダー付きでリクエスト
      const newPost = await ApiClient.postFormData<{ id: number }>(
        "/posts",
        formData,
      );
      onPostCreated?.();

      const message = replyToId
        ? "リプライをしました。"
        : "投稿を作成しました。";
      showToast(message, "success", 3000, () => {
        navigateToPost(newPost.id);
      });
    } catch (err) {
      console.error("Failed to create post:", err);
      if (err instanceof Error) {
        if (err.message.includes("Authentication")) {
          setError("認証エラー: ログインし直してください");
          showToast("認証エラー: ログインし直してください。", "error");
        } else {
          setError(`投稿の作成に失敗しました: ${err.message}`);
          showToast(`投稿の作成に失敗しました: ${err.message}`, "error");
        }
      } else {
        setError("投稿の作成に失敗しました");
        showToast("投稿の作成に失敗しました。", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = () => setError(null);

  return {
    isSubmitting,
    error,
    handleSubmit,
    clearError,
  };
};
