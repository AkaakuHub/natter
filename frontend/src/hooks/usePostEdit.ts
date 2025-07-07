import { useState } from "react";
import { PostsApi } from "@/api/posts";
import { Post } from "@/api/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/useToast";

interface UsePostEditResult {
  isEditing: boolean;
  error: string | null;
  editPost: (
    id: number,
    content: string,
    images?: File[],
  ) => Promise<Post | null>;
  canEdit: (post: Post) => boolean;
}

export const usePostEdit = (): UsePostEditResult => {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useCurrentUser();
  const { showToast } = useToast();

  const canEdit = (post: Post): boolean => {
    return currentUser?.id === post.authorId;
  };

  const editPost = async (
    id: number,
    content: string,
    images?: File[],
  ): Promise<Post | null> => {
    console.log("✏️ editPost called:", {
      id,
      content,
      images: images?.length || 0,
      user: currentUser?.id,
    });

    if (!currentUser) {
      console.log("❌ No user for edit");
      setError("ログインが必要です");
      return null;
    }

    try {
      setIsEditing(true);
      setError(null);

      let updatedPost: Post;

      if (images && images.length > 0) {
        console.log("🖼️ Updating with images using FormData");
        // 画像がある場合はFormDataを使用
        const formData = new FormData();
        formData.append("content", content);

        images.forEach((image) => {
          formData.append("images", image);
        });

        updatedPost = await PostsApi.updatePostWithImages(id, formData);
      } else {
        console.log("📝 Updating text only");
        // テキストのみの場合は通常のAPIを使用
        updatedPost = await PostsApi.updatePost(id, {
          content,
        });
      }

      console.log("✅ Edit API call successful:", updatedPost);
      showToast("投稿を編集しました", "success");

      // updatedAtを現在時刻で更新
      const updatedPostWithTimestamp = {
        ...updatedPost,
        updatedAt: new Date().toISOString(),
      };

      return updatedPostWithTimestamp;
    } catch (err) {
      console.error("❌ Edit API call failed:", err);
      const errorMessage =
        err instanceof Error ? err.message : "投稿の編集に失敗しました";
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
