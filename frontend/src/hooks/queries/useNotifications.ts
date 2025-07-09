import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationsApi } from "@/api";
import type {
  Notification,
  CreateNotificationDto,
  UpdateNotificationDto,
} from "@/api/notifications";

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
    staleTime: 30 * 1000, // 30秒間はフレッシュとみなす
    refetchOnWindowFocus: true,
  });
};

// 単一通知取得
export const useNotification = (id: number) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.notification(id),
    queryFn: () => NotificationsApi.getNotification(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5分間はフレッシュとみなす
  });
};

// 未読通知数取得
export const useUnreadCount = () => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
    queryFn: () => NotificationsApi.getUnreadCount(),
    staleTime: 10 * 1000, // 10秒間はフレッシュとみなす
    refetchInterval: 30 * 1000, // 30秒ごとに自動更新
    refetchOnWindowFocus: true,
  });
};

// 通知作成
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNotificationDto) =>
      NotificationsApi.createNotification(data),
    onSuccess: (newNotification) => {
      // 通知一覧のキャッシュに新しい通知を追加
      queryClient.setQueryData(
        NOTIFICATION_QUERY_KEYS.notifications,
        (oldNotifications: Notification[] | undefined) => {
          if (!oldNotifications) return [newNotification];
          return [newNotification, ...oldNotifications];
        },
      );

      // 未読数を更新
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
      });
    },
  });
};

// 通知更新
export const useUpdateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNotificationDto }) =>
      NotificationsApi.updateNotification(id, data),
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

// 通知削除
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => NotificationsApi.deleteNotification(id),
    onSuccess: (_, deletedId) => {
      // 通知一覧のキャッシュから削除
      queryClient.setQueryData(
        NOTIFICATION_QUERY_KEYS.notifications,
        (oldNotifications: Notification[] | undefined) => {
          return oldNotifications?.filter(
            (notification) => notification.id !== deletedId,
          );
        },
      );

      // 特定の通知キャッシュを削除
      queryClient.removeQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.notification(deletedId),
      });

      // 未読数を更新
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
      });
    },
  });
};
