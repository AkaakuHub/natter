import { useState } from "react";
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

  const canDelete = (post: Post): boolean => {
    return currentUser?.id === post.authorId;
  };

  const deletePost = async (id: number): Promise<boolean> => {
    console.log("🗑️ deletePost called:", { id, user: currentUser?.id });

    if (!currentUser) {
      console.log("❌ No user for delete");
      setError("ログインが必要です");
      return false;
    }

    try {
      setIsDeleting(true);
      setError(null);

      console.log("🚀 Making delete API call:", id);
      await PostsApi.deletePost(id);
      console.log("✅ Delete API call successful");
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
