import { useState } from "react";
import { PostsApi } from "@/api/posts";
import { Post } from "@/api/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/useToast";
import { appendNormalizedImages } from "@/utils/normalizePostImages";

interface UsePostEditResult {
  isEditing: boolean;
  error: string | null;
  editPost: (id: number, input: EditPostInput) => Promise<Post | null>;
  canEdit: (post: Post) => boolean;
}

interface EditPostInput {
  content: string;
  retainedImages: string[];
  newImages: File[];
  imagesPublic: boolean;
  url: string;
  characterId: number | null;
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
    input: EditPostInput,
  ): Promise<Post | null> => {
    if (!currentUser) {
      setError("ログインが必要です");
      return null;
    }

    try {
      setIsEditing(true);
      setError(null);

      let updatedPost: Post;

      if (input.newImages.length > 0) {
        const formData = new FormData();
        formData.append("content", input.content);
        formData.append("imagesPublic", input.imagesPublic.toString());
        formData.append("url", input.url.trim());
        if (input.characterId !== null) {
          formData.append("characterId", input.characterId.toString());
        } else {
          formData.append("characterId", "");
        }
        input.retainedImages.forEach((image) => {
          formData.append("existingImages", image);
        });

        await appendNormalizedImages(formData, input.newImages);

        updatedPost = await PostsApi.updatePostWithImages(id, formData);
      } else {
        updatedPost = await PostsApi.updatePost(id, {
          content: input.content,
          images: input.retainedImages,
          imagesPublic: input.imagesPublic,
          url: input.url.trim(),
          characterId: input.characterId,
        });
      }
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
