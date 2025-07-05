import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto) {
    const { images, authorId, ...postData } = createPostDto;

    if (!authorId) {
      throw new BadRequestException('Invalid authorId');
    }

    // ユーザーが存在するかチェック
    const user = await this.prisma.user.findUnique({
      where: { id: authorId },
    });

    if (!user) {
      throw new BadRequestException(`User with id ${authorId} does not exist`);
    }

    return this.prisma.post.create({
      data: {
        ...postData,
        authorId,
        images: images ? JSON.stringify(images) : null,
      },
      include: {
        author: true,
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
    });
  }

  async findAll() {
    const posts = await this.prisma.post.findMany({
      include: {
        author: true,
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
    });

    return posts.map((post) => ({
      ...post,
      images: post.images ? JSON.parse(post.images) : [],
    }));
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
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
    });

    if (!post) {
      return null;
    }

    return {
      ...post,
      images: post.images ? JSON.parse(post.images) : [],
    };
  }

  async findByUser(userId: string) {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: true,
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
    });

    return posts.map((post) => ({
      ...post,
      images: post.images ? JSON.parse(post.images) : [],
    }));
  }

  async findMediaPosts() {
    const posts = await this.prisma.post.findMany({
      where: {
        images: {
          not: null,
        },
      },
      include: {
        author: true,
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
    });

    return posts
      .filter((post) => post.images && JSON.parse(post.images).length > 0)
      .map((post) => ({
        ...post,
        images: post.images ? JSON.parse(post.images) : [],
      }));
  }

  async findLikedPosts(userId: string) {
    const likedPosts = await this.prisma.like.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: true,
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return likedPosts.map((like) => ({
      ...like.post,
      images: like.post.images ? JSON.parse(like.post.images) : [],
    }));
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const { images, ...postData } = updatePostDto;
    return this.prisma.post.update({
      where: { id },
      data: {
        ...postData,
        images: images ? JSON.stringify(images) : undefined,
      },
      include: {
        author: true,
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
    });
  }

  async remove(id: number) {
    return this.prisma.post.delete({
      where: { id },
    });
  }

  async likePost(postId: number, userId: string) {
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
      return { liked: false };
    } else {
      await this.prisma.like.create({
        data: {
          userId,
          postId,
        },
      });
      return { liked: true };
    }
  }

  async getPostLikes(postId: number) {
    const likes = await this.prisma.like.findMany({
      where: { postId },
      include: {
        user: true,
      },
    });

    return {
      count: likes.length,
      users: likes.map((like) => like.user),
    };
  }
}
