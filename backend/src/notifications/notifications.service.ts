import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    // 自分自身への通知は作成しない
    if (createNotificationDto.userId === createNotificationDto.actorId) {
      return null;
    }

    return this.prisma.notification.create({
      data: createNotificationDto,
      include: {
        user: true,
        actor: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        userId,
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.notification.findUnique({
      where: { id },
      include: {
        user: true,
        actor: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return this.prisma.notification.update({
      where: { id },
      data: updateNotificationDto,
      include: {
        user: true,
        actor: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async markAsRead(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  // いいね通知を作成
  async createLikeNotification(postId: number, actorId: string) {
    // 投稿の作成者を取得
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!post || !post.author) {
      return null;
    }

    // 既存のいいね通知があるかチェック
    const existingNotification = await this.prisma.notification.findFirst({
      where: {
        type: 'like',
        postId,
        actorId,
        userId: post.author.id,
      },
    });

    if (existingNotification) {
      return existingNotification;
    }

    return this.create({
      type: 'like',
      message: 'があなたの投稿にいいねしました',
      userId: post.author.id,
      actorId,
      postId,
    });
  }

  // いいね通知を削除（いいね取り消し時）
  async removeLikeNotification(postId: number, actorId: string) {
    // 投稿の作成者を取得
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!post || !post.author) {
      return null;
    }

    return this.prisma.notification.deleteMany({
      where: {
        type: 'like',
        postId,
        actorId,
        userId: post.author.id,
      },
    });
  }

  // フォロー通知を作成
  async createFollowNotification(userId: string, actorId: string) {
    // 既存のフォロー通知があるかチェック
    const existingNotification = await this.prisma.notification.findFirst({
      where: {
        type: 'follow',
        userId,
        actorId,
      },
    });

    if (existingNotification) {
      return existingNotification;
    }

    return this.create({
      type: 'follow',
      message: 'があなたをフォローしました',
      userId,
      actorId,
    });
  }

  // フォロー通知を削除（アンフォロー時）
  async removeFollowNotification(userId: string, actorId: string) {
    return this.prisma.notification.deleteMany({
      where: {
        type: 'follow',
        userId,
        actorId,
      },
    });
  }
}
