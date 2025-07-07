import { useCallback } from "react";
import { useToast } from "./useToast";

interface ShareData {
  url: string;
  title: string;
  text: string;
}

export const usePostShare = () => {
  const { showToast } = useToast();

  const sharePost = useCallback(
    async (postId: string, postContent: string, authorName: string) => {
      const shareData: ShareData = {
        url: `${window.location.origin}/post/${postId}`,
        title: `${authorName}さんの投稿 - Natter`,
        text:
          postContent.length > 100
            ? `${postContent.substring(0, 100)}...`
            : postContent,
      };

      try {
        // Web Share API が使用可能かチェック
        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare(shareData)
        ) {
          await navigator.share(shareData);
          showToast("投稿を共有しました", "success", 3000);
        } else {
          // フォールバック: クリップボードにURLをコピー
          await navigator.clipboard.writeText(shareData.url);
          showToast(
            "投稿のURLをクリップボードにコピーしました",
            "success",
            3000,
          );
        }
      } catch (error) {
        // エラーハンドリング
        if (error instanceof Error && error.name === "AbortError") {
          // ユーザーがキャンセルした場合は何もしない
          return;
        }

        try {
          // Web Share API が失敗した場合、クリップボードにコピーを試行
          await navigator.clipboard.writeText(shareData.url);
          showToast(
            "投稿のURLをクリップボードにコピーしました",
            "success",
            3000,
          );
        } catch (clipboardError) {
          // クリップボードへのコピーも失敗した場合
          console.error(
            "Failed to share or copy to clipboard:",
            clipboardError,
          );
          showToast(
            "共有に失敗しました。URLを手動でコピーしてください。",
            "error",
            5000,
          );
        }
      }
    },
    [showToast],
  );

  return {
    sharePost,
  };
};
