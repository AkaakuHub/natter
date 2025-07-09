import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // デフォルトのスタンバイ時間を30秒に設定
      staleTime: 30 * 1000,
      // キャッシュ時間を5分に設定
      gcTime: 5 * 60 * 1000,
      // エラー時の再試行回数を1回に制限
      retry: 1,
      // バックグラウンドでの再フェッチを無効化
      refetchOnWindowFocus: false,
      // ネットワーク再接続時の再フェッチを有効化
      refetchOnReconnect: true,
    },
    mutations: {
      // ミューテーション失敗時の再試行を無効化
      retry: false,
    },
  },
});
