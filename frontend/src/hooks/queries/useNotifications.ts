import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationsApi } from "@/api";
import type { Notification } from "@/api/notifications";

// クエリキー
const NOTIFICATION_QUERY_KEYS = {
  notifications: ["notifications"] as const,
  notification: (id: number) => ["notification", id] as const,
  unreadCount: ["notifications", "unread-count"] as const,
} as const;

// 通知一覧取得
export const useNotifications = () => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.notifications,
    queryFn: () => NotificationsApi.getNotifications(),
    staleTime: 0, // 常に最新データを取得（スケルトン問題回避のため）
    refetchOnWindowFocus: true,
    refetchOnMount: true, // マウント時に常に再フェッチ
    retry: 3, // 失敗時のリトライ回数
    retryDelay: 1000, // リトライ間隔
  });
};

// 通知を既読にする
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => NotificationsApi.markAsRead(id),
    onSuccess: (updatedNotification) => {
      // 特定の通知キャッシュを更新
      queryClient.setQueryData(
        NOTIFICATION_QUERY_KEYS.notification(updatedNotification.id),
        updatedNotification,
      );

      // 通知一覧のキャッシュを更新
      queryClient.setQueryData(
        NOTIFICATION_QUERY_KEYS.notifications,
        (oldNotifications: Notification[] | undefined) => {
          return oldNotifications?.map((notification) =>
            notification.id === updatedNotification.id
              ? updatedNotification
              : notification,
          );
        },
      );

      // 未読数を更新
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
      });
    },
  });
};

// 全通知を既読にする
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationsApi.markAllAsRead(),
    onSuccess: () => {
      // 通知一覧のキャッシュを更新（すべて既読にする）
      queryClient.setQueryData(
        NOTIFICATION_QUERY_KEYS.notifications,
        (oldNotifications: Notification[] | undefined) => {
          return oldNotifications?.map((notification) => ({
            ...notification,
            read: true,
          }));
        },
      );

      // 未読数を更新
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
      });
    },
  });
};
