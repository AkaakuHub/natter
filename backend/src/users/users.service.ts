import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateUserData {
  twitterId: string;
  name: string;
  email?: string;
  image?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(userData: CreateUserData) {
    return this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
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

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
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