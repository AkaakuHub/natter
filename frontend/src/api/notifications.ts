import { ApiClient } from "./client";

export interface Notification {
  id: number;
  type: string;
  message?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  actorId: string;
  postId?: number;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  actor: {
    id: string;
    name: string;
    image?: string;
  };
  post?: {
    id: number;
    content: string;
    author: {
      id: string;
      name: string;
    };
  };
}

interface CreateNotificationDto {
  type: string;
  message?: string;
  userId: string;
  actorId: string;
  postId?: number;
  read?: boolean;
}

interface UpdateNotificationDto {
  type?: string;
  message?: string;
  read?: boolean;
}

export class NotificationsApi {
  static async getNotifications(): Promise<Notification[]> {
    return ApiClient.get("/notifications");
  }

  static async getNotification(id: number): Promise<Notification> {
    return ApiClient.get(`/notifications/${id}`);
  }

  static async createNotification(
    data: CreateNotificationDto,
  ): Promise<Notification> {
    return ApiClient.post("/notifications", data);
  }

  static async updateNotification(
    id: number,
    data: UpdateNotificationDto,
  ): Promise<Notification> {
    return ApiClient.patch(`/notifications/${id}`, data);
  }

  static async markAsRead(id: number): Promise<Notification> {
    return ApiClient.patch(`/notifications/${id}/read`);
  }

  static async markAllAsRead(): Promise<void> {
    return ApiClient.patch("/notifications/mark-all-read");
  }

  static async getUnreadCount(): Promise<{ count: number }> {
    return ApiClient.get("/notifications/unread-count");
  }

  static async deleteNotification(id: number): Promise<void> {
    return ApiClient.delete(`/notifications/${id}`);
  }
}
