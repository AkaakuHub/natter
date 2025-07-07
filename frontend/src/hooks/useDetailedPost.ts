import { useState, useEffect } from "react";
import { Post, PostsApi } from "@/api";

interface UseDetailedPostResult {
  post: Post | null;
  replies: Post[];
  loading: boolean;
  error: string | null;
  refreshPost: () => Promise<void>;
  addReply: (reply: Post) => void;
  setReplies: React.Dispatch<React.SetStateAction<Post[]>>;
}

export const useDetailedPost = (
  postId: string,
  currentUserId?: string,
): UseDetailedPostResult => {
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = async () => {
    // postIdの妥当性をチェック
    if (!postId || postId === "undefined" || postId === "null") {
      setError("投稿IDが無効です");
      setLoading(false);
      return;
    }

    const numericPostId = parseInt(postId);
    if (isNaN(numericPostId)) {
      setError("投稿IDが無効です");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [fetchedPost, fetchedReplies] = await Promise.all([
        PostsApi.getPostById(numericPostId),
        PostsApi.getReplies(numericPostId),
      ]);

      console.log("Fetched post:", fetchedPost);
      console.log("Fetched replies:", fetchedReplies);

      setPost(fetchedPost);
      setReplies(fetchedReplies);
    } catch (err) {
      console.error("Failed to fetch post:", err);
      setError("投稿の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const addReply = (reply: Post) => {
    setReplies((prev) => [...prev, reply]);
  };

  useEffect(() => {
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, currentUserId]);

  return {
    post,
    replies,
    loading,
    error,
    refreshPost: fetchPost,
    addReply,
    setReplies,
  };
};
