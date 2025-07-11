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
    console.log("🚨 [USE DETAILED POST] fetchPost called with postId:", postId);
    console.log("🚨 [USE DETAILED POST] postId type:", typeof postId);
    console.log("🚨 [USE DETAILED POST] Stack trace:", new Error().stack);

    // postIdの妥当性をチェック
    if (!postId || postId === "undefined" || postId === "null") {
      console.log("🚨 [USE DETAILED POST] Invalid postId:", postId);
      setError("投稿IDが無効です");
      setLoading(false);
      return;
    }

    // parseIntは大きな数値で精度を失うので、バックエンドがstring IDを受け入れるよう修正するまでの暫定対処
    const numericPostId = Number(postId);
    if (isNaN(numericPostId) || !Number.isSafeInteger(numericPostId)) {
      console.log("🔍 [USE DETAILED POST] Invalid or unsafe postId:", postId);
      setError("投稿IDが無効です");
      setLoading(false);
      return;
    }

    console.log("🔍 [USE DETAILED POST] Using numeric postId:", numericPostId);

    try {
      setLoading(true);
      setError(null);

      const [fetchedPost, fetchedReplies] = await Promise.all([
        PostsApi.getPostById(numericPostId),
        PostsApi.getReplies(numericPostId),
      ]);

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
