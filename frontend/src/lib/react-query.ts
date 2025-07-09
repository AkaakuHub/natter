import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // リアルタイム更新のためstaleTimeを短縮
      staleTime: 10 * 1000, // 10秒に短縮
      // キャッシュ時間を5分に設定
      gcTime: 5 * 60 * 1000,
      // エラー時の再試行回数を1回に制限
      retry: 1,
      // ウィンドウフォーカス時の再フェッチを有効化（リアルタイム性向上）
      refetchOnWindowFocus: true,
      // ネットワーク再接続時の再フェッチを有効化
      refetchOnReconnect: true,
      // バックグラウンドでの再フェッチ間隔を設定（5分）
      refetchInterval: 5 * 60 * 1000,
    },
    mutations: {
      // ミューテーション失敗時の再試行を無効化
      retry: false,
    },
  },
});
