import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PostsApi } from "@/api/posts";
import { Post } from "@/api/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/useToast";

interface UsePostDeleteResult {
  isDeleting: boolean;
  error: string | null;
  deletePost: (id: number) => Promise<boolean>;
  canDelete: (post: Post) => boolean;
}

export const usePostDelete = (): UsePostDeleteResult => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useCurrentUser();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const canDelete = (post: Post): boolean => {
    return currentUser?.id === post.authorId;
  };

  const deletePost = async (id: number): Promise<boolean> => {
    if (!currentUser) {
      setError("ログインが必要です");
      return false;
    }

    try {
      setIsDeleting(true);
      setError(null);
      await PostsApi.deletePost(id);
      // キャラクターキャッシュを無効化（ポスト削除でキャラクターの使用回数が変更されるため）
      queryClient.invalidateQueries({
        queryKey: ["characters"],
      });

      showToast("投稿を削除しました", "success");
      return true;
    } catch (err) {
      console.error("❌ Delete API call failed:", err);
      const errorMessage =
        err instanceof Error ? err.message : "投稿の削除に失敗しました";
      setError(errorMessage);
      showToast(errorMessage, "error");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    error,
    deletePost,
    canDelete,
  };
};
