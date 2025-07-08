import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateUserData {
  twitterId: string;
  name: string;
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
    console.log('🔍 findOrCreateByTwitterId called with:', {
      twitterId,
      name,
      image,
    });
    let user = await this.findByTwitterId(twitterId);

    if (!user) {
      console.log('🔍 User not found, creating new user with name:', name);
      user = await this.create({
        twitterId,
        name,
        image,
      });
      console.log('🔍 Created user:', user);
    } else {
      console.log('🔍 Found existing user:', user);
    }

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany();
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
          },
        },
      },
    });
  }
}
