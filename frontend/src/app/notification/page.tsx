"use client";

import React, { useEffect } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BaseLayout from "@/components/layout/BaseLayout";
import NotificationItem from "@/components/NotificationItem";
import {
  useNotifications,
  useMarkAllAsRead,
} from "@/hooks/queries/useNotifications";
import { IconBell, IconBellOff } from "@tabler/icons-react";

export default function Notification() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: notifications, isLoading, error } = useNotifications();
  const markAllAsReadMutation = useMarkAllAsRead();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status, router]);

  const handleMarkAllAsRead = () => {
    if (notifications && notifications.some((n) => !n.read)) {
      markAllAsReadMutation.mutate();
    }
  };

  if (status === "loading") {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center h-64">
          <div>Loading...</div>
        </div>
      </BaseLayout>
    );
  }

  if (!session) {
    return null;
  }

  if (isLoading) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center h-64">
          <div>通知を読み込み中...</div>
        </div>
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-error">通知の読み込みに失敗しました</div>
        </div>
      </BaseLayout>
    );
  }

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return (
    <BaseLayout>
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconBell size={24} className="text-primary" />
            <h1 className="text-xl font-bold text-text">通知</h1>
            {unreadCount > 0 && (
              <span className="bg-primary text-text-inverse text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="text-sm text-primary hover:text-primary-hover disabled:opacity-50 transition-colors"
            >
              {markAllAsReadMutation.isPending ? "処理中..." : "すべて既読"}
            </button>
          )}
        </div>

        {/* 通知一覧 */}
        <div className="min-h-screen">
          {notifications && notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-text-muted">
              <IconBellOff size={48} className="mb-4" />
              <p className="text-lg">通知はありません</p>
              <p className="text-sm mt-2">
                誰かがあなたの投稿にいいねしたり、返信したりすると通知が表示されます
              </p>
            </div>
          )}
        </div>
      </div>
    </BaseLayout>
  );
}
