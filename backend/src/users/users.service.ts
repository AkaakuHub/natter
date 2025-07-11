import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateUserData {
  twitterId: string;
  name: string;
  image?: string;
}

interface UpdateUserData {
  name?: string;
  image?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(userData: CreateUserData) {
    return this.prisma.user.create({
      data: {
        id: userData.twitterId,
        name: userData.name,
        image: userData.image,
        twitterId: userData.twitterId,
      },
    });
  }

  async findByTwitterId(twitterId: string) {
    const user = await this.prisma.user.findUnique({
      where: { twitterId },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async findOrCreateByTwitterId(
    twitterId: string,
    name: string,
    image?: string,
  ) {
    // 名前の検証: フォールバック名の場合は警告
    if (name.startsWith('User_')) {
      console.warn('⚠️  Warning: Using fallback name pattern:', name);
    }

    let user = await this.findByTwitterId(twitterId);

    if (!user) {
      user = await this.create({
        twitterId,
        name,
        image,
      });
    } else {
      // 既存ユーザーの名前がフォールバック名で、新しい名前が実際の名前の場合、更新
      if (user.name.startsWith('User_') && !name.startsWith('User_')) {
        user = await this.prisma.user.update({
          where: { twitterId },
          data: {
            name,
            image: image || user.image,
          },
        });
      }
    }

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async updateUser(id: string, updateData: UpdateUserData) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });
      return updatedUser;
    } catch (error) {
      console.error('❌ Error updating user:', error);
      return null;
    }
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        posts: {
          include: {
            likes: {
              include: {
                user: true,
              },
            },
            _count: {
              select: {
                likes: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            posts: true,
            likes: true,
            following: true,
            followers: true,
          },
        },
      },
    });
  }

  async getRecommendedUsers(limit: number = 5, excludeUserId?: string) {
    const users = await this.prisma.user.findMany({
      where: excludeUserId
        ? {
            id: {
              not: excludeUserId,
            },
          }
        : undefined,
      include: {
        _count: {
          select: {
            posts: true,
            likes: true,
          },
        },
      },
      orderBy: [
        {
          posts: {
            _count: 'desc',
          },
        },
        {
          createdAt: 'desc',
        },
      ],
      take: limit,
    });

    return users;
  }
}
