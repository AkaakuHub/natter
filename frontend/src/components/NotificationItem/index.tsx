"use client";

import React from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import {
  IconHeart,
  IconMessageCircle,
  IconUserPlus,
} from "@tabler/icons-react";
import { Notification } from "@/api/notifications";
import { useMarkAsRead } from "@/hooks/queries/useNotifications";
import { useRouter } from "next/navigation";

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
}) => {
  const router = useRouter();
  const markAsReadMutation = useMarkAsRead();

  const handleClick = () => {
    // 未読の場合は既読にする
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }

    // 投稿関連の通知の場合は投稿詳細ページに遷移
    if (notification.postId) {
      router.push(`/post/${notification.postId}`);
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "like":
        return <IconHeart size={20} className="text-error" />;
      case "reply":
        return <IconMessageCircle size={20} className="text-interactive" />;
      case "follow":
        return <IconUserPlus size={20} className="text-primary" />;
      default:
        return <IconHeart size={20} className="text-text-muted" />;
    }
  };

  const getNotificationMessage = () => {
    const actorName = notification.actor?.name || "不明なユーザー";
    switch (notification.type) {
      case "like":
        return `${actorName}があなたの投稿にいいねしました`;
      case "reply":
        return `${actorName}があなたの投稿に返信しました`;
      case "follow":
        return `${actorName}があなたをフォローしました`;
      default:
        return notification.message || "通知があります";
    }
  };

  const getPostPreview = () => {
    if (notification.post && notification.post.content) {
      const preview = notification.post.content.slice(0, 50);
      return preview.length < notification.post.content.length
        ? `${preview}...`
        : preview;
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ja,
    });
  };

  return (
    <article
      onClick={handleClick}
      className={`bg-surface hover:bg-surface-elevated transition-colors duration-200 border-b border-border py-6 px-6 cursor-pointer ${
        !notification.read ? "bg-primary/5 border-l-4 border-l-primary" : ""
      }`}
    >
      <div className="flex gap-4">
        {/* アクターのアバター */}
        <div className="flex-shrink-0">
          <Image
            src={notification.actor?.image || "/no_avatar_image_128x128.png"}
            alt={notification.actor?.name || "不明なユーザー"}
            width={48}
            height={48}
            className="rounded-full"
          />
        </div>

        {/* 通知内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {getNotificationIcon()}
            <span className="text-sm font-medium text-text">
              {getNotificationMessage()}
            </span>
            {/* 未読インジケーター */}
            {!notification.read && (
              <div className="w-2 h-2 bg-primary rounded-full ml-auto"></div>
            )}
          </div>

          {/* 投稿プレビュー */}
          {getPostPreview() && (
            <div className="mt-3 p-3 bg-surface-variant rounded-lg border border-border">
              <p className="text-sm text-text-secondary line-clamp-2">
                {getPostPreview()}
              </p>
            </div>
          )}

          {/* 日時 */}
          <div className="mt-3 text-xs text-text-muted">
            {formatDate(notification.createdAt)}
          </div>
        </div>
      </div>
    </article>
  );
};

export default NotificationItem;
