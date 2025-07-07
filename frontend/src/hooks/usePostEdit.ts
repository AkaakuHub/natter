import { useState } from "react";
import { PostsApi } from "@/api/posts";
import { Post } from "@/api/types";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/useToast";

interface UsePostEditResult {
  isEditing: boolean;
  error: string | null;
  editPost: (id: number, content: string, images?: File[]) => Promise<Post | null>;
  canEdit: (post: Post) => boolean;
}

export const usePostEdit = (): UsePostEditResult => {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const canEdit = (post: Post): boolean => {
    return user?.id === post.authorId;
  };

  const editPost = async (
    id: number,
    content: string,
    images?: File[],
  ): Promise<Post | null> => {
    if (!user) {
      setError("ログインが必要です");
      return null;
    }

    try {
      setIsEditing(true);
      setError(null);

      let updatedPost: Post;

      if (images && images.length > 0) {
        // 画像がある場合はFormDataを使用
        const formData = new FormData();
        formData.append("content", content);
        formData.append("authorId", user.id);
        
        images.forEach((image) => {
          formData.append("images", image);
        });

        updatedPost = await PostsApi.updatePostWithImages(id, formData);
      } else {
        // テキストのみの場合は通常のAPIを使用
        updatedPost = await PostsApi.updatePost(id, {
          content,
          authorId: user.id,
        });
      }

      showToast("投稿を編集しました", "success");
      return updatedPost;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "投稿の編集に失敗しました";
      setError(errorMessage);
      showToast(errorMessage, "error");
      return null;
    } finally {
      setIsEditing(false);
    }
  };

  return {
    isEditing,
    error,
    editPost,
    canEdit,
  };
};