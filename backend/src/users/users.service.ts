import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateUserData {
  discordId: string;
  name: string;
  image?: string | null;
}

interface UpdateUserData {
  name?: string;
  image?: string | null;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(userData: CreateUserData) {
    return this.prisma.user.create({
      data: {
        id: userData.discordId,
        name: userData.name,
        image: userData.image,
        discordId: userData.discordId,
      },
    });
  }

  async findByDiscordId(discordId: string) {
    const user = await this.prisma.user.findUnique({
      where: { discordId },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async findOrCreateByDiscordId(
    discordId: string,
    name: string,
    image?: string | null,
  ) {
    let user = await this.findByDiscordId(discordId);

    if (!user) {
      user = await this.create({
        discordId,
        name,
        image,
      });
    } else {
      user = await this.prisma.user.update({
        where: { discordId },
        data: {
          name,
          image,
        },
      });
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
