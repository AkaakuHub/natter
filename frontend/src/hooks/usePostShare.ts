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
      const postUrl = `${window.location.origin}/post/${postId}`;
      const shareText = `${authorName}さんの投稿\n${postContent}\n${postUrl}`;

      const shareData: ShareData = {
        url: postUrl,
        title: `${authorName}さんの投稿 - Natter`,
        text: shareText,
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
          // フォールバック: クリップボードに指定形式のテキストをコピー
          await navigator.clipboard.writeText(shareText);
          showToast("投稿をクリップボードにコピーしました", "success", 3000);
        }
      } catch (error) {
        // エラーハンドリング
        if (error instanceof Error && error.name === "AbortError") {
          // ユーザーがキャンセルした場合は何もしない
          return;
        }

        try {
          // Web Share API が失敗した場合、クリップボードにコピーを試行
          await navigator.clipboard.writeText(shareText);
          showToast("投稿をクリップボードにコピーしました", "success", 3000);
        } catch (clipboardError) {
          // クリップボードへのコピーも失敗した場合
          console.error(
            "Failed to share or copy to clipboard:",
            clipboardError,
          );
          showToast(
            "共有に失敗しました。テキストを手動でコピーしてください。",
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
