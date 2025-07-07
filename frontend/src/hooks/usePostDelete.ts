import { useState } from "react";
import { PostsApi } from "@/api/posts";
import { Post } from "@/api/types";
import { useAuthStore } from "@/stores/authStore";
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
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const canDelete = (post: Post): boolean => {
    return user?.id === post.authorId;
  };

  const deletePost = async (id: number): Promise<boolean> => {
    if (!user) {
      setError("ログインが必要です");
      return false;
    }

    try {
      setIsDeleting(true);
      setError(null);

      await PostsApi.deletePost(id);
      showToast("投稿を削除しました", "success");
      return true;
    } catch (err) {
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
