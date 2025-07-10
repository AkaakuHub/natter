import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
    url?: string,
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
  const queryClient = useQueryClient();

  const handleSubmit = async (
    content: string,
    images: File[],
    url?: string,
    replyToId?: number,
    characterId?: number,
  ) => {
    if (!content.trim() && images.length === 0 && !characterId) {
      setError("投稿内容、画像、またはキャラクターを設定してください");
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

      if (url?.trim()) {
        formData.append("url", url.trim());
      }

      if (replyToId) {
        formData.append("replyToId", replyToId.toString());
      }

      if (characterId && typeof characterId === "number") {
        console.log("Adding characterId to FormData:", characterId);
        formData.append("characterId", characterId.toString());
      } else {
        console.log(
          "No characterId provided or invalid type:",
          characterId,
          typeof characterId,
        );
      }

      images.forEach((file) => {
        formData.append("images", file);
      });

      // ApiClient を使用して認証ヘッダー付きでリクエスト
      const newPost = await ApiClient.postFormData<{ id: number }>(
        "/posts",
        formData,
      );

      // キャラクターが使用された場合、キャラクター一覧のキャッシュを無効化
      if (characterId) {
        queryClient.invalidateQueries({
          queryKey: ["characters"],
        });
        // ユーザー別のキャラクター一覧も無効化
        queryClient.invalidateQueries({
          queryKey: ["characters", currentUser.id],
        });
      }

      // 投稿一覧のキャッシュも無効化（新しい投稿を反映）
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });

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
