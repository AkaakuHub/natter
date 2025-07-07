import { useState } from "react";
import { User } from "@/api";
import { useToast } from "@/hooks/useToast";
import { useNavigation } from "@/hooks/useNavigation";

interface UsePostSubmitResult {
  isSubmitting: boolean;
  error: string | null;
  handleSubmit: (
    content: string,
    images: File[],
    replyToId?: number,
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

      const formData = new FormData();
      if (content.trim()) {
        formData.append("content", content.trim());
      }
      formData.append("authorId", currentUser.id);

      if (replyToId) {
        formData.append("replyToId", replyToId.toString());
      }

      images.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("投稿の作成に失敗しました");
      }

      const newPost = await response.json();
      onPostCreated?.();

      const message = replyToId
        ? "リプライをしました。"
        : "投稿を作成しました。";
      showToast(message, "success", 3000, () => {
        navigateToPost(newPost.id);
      });
    } catch (err) {
      console.error("Failed to create post:", err);
      setError("投稿の作成に失敗しました");
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
