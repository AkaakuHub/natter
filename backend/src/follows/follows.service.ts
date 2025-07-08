import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowsService {
  constructor(private prisma: PrismaService) {}

  async followUser(followerId: string, followingId: string) {
    // 自分自身をフォローできない
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    // フォロー対象ユーザーが存在するか確認
    const targetUser = await this.prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!targetUser) {
      throw new BadRequestException('User not found');
    }

    // 既にフォローしているかチェック
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new BadRequestException('Already following this user');
    }

    // フォロー関係を作成
    const follow = await this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return {
      message: 'Successfully followed user',
      follow,
    };
  }

  async unfollowUser(followerId: string, followingId: string) {
    // フォロー関係が存在するかチェック
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!existingFollow) {
      throw new BadRequestException('Not following this user');
    }

    // フォロー関係を削除
    await this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return {
      message: 'Successfully unfollowed user',
    };
  }

  async getFollowing(userId: string) {
    const following = await this.prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            image: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return following.map((follow) => ({
      ...follow.following,
      followedAt: follow.createdAt,
    }));
  }

  async getFollowers(userId: string) {
    const followers = await this.prisma.follow.findMany({
      where: {
        followingId: userId,
      },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            image: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return followers.map((follow) => ({
      ...follow.follower,
      followedAt: follow.createdAt,
    }));
  }

  async getFollowStatus(followerId: string, followingId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return {
      isFollowing: !!follow,
      followedAt: follow?.createdAt,
    };
  }

  async getFollowCounts(userId: string) {
    const [followingCount, followersCount] = await Promise.all([
      this.prisma.follow.count({
        where: { followerId: userId },
      }),
      this.prisma.follow.count({
        where: { followingId: userId },
      }),
    ]);

    return {
      followingCount,
      followersCount,
    };
  }
}
