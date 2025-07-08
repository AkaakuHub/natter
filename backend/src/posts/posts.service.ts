import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as validator from 'validator';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  private sanitizeContent(content: string): string {
    if (!content) return content;

    // HTMLエンティティをエスケープし、XSS攻撃を防ぐ
    return validator.escape(content);
  }

  async create(createPostDto: CreatePostDto) {
    const { images, authorId, replyToId, ...postData } = createPostDto;

    // コンテンツをサニタイズ
    const sanitizedPostData = {
      ...postData,
      title: postData.title ? this.sanitizeContent(postData.title) : undefined,
      content: postData.content
        ? this.sanitizeContent(postData.content)
        : undefined,
    };

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

    // リプライ先の投稿が存在するかチェック
    if (replyToId) {
      const replyToPost = await this.prisma.post.findUnique({
        where: { id: replyToId },
      });

      if (!replyToPost) {
        throw new BadRequestException(
          `Post with id ${replyToId} does not exist`,
        );
      }
    }

    return this.prisma.post.create({
      data: {
        ...sanitizedPostData,
        authorId,
        replyToId,
        images: images ? JSON.stringify(images) : null,
      },
      include: {
        author: true,
        likes: {
          include: {
            user: true,
          },
        },
        replyTo: {
          include: {
            author: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });
  }

  async findAll() {
    const posts = await this.prisma.post.findMany({
      where: {
        deletedAt: null, // 削除されていない投稿のみ
      },
      include: {
        author: true,
        likes: {
          include: {
            user: true,
          },
        },
        replyTo: {
          include: {
            author: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // replyToが削除されている場合の処理
    const postsWithReplyTo = await Promise.all(
      posts.map(async (post) => {
        let replyTo = post.replyTo;

        // replyToIdがあるが replyTo が null の場合、削除された投稿を取得
        if (post.replyToId && !post.replyTo) {
          const deletedReplyTo = await this.prisma.post.findUnique({
            where: { id: post.replyToId },
            include: {
              author: true,
            },
          });
          replyTo = deletedReplyTo;
        }

        return {
          ...post,
          replyTo,
          images: post.images ? (JSON.parse(post.images) as string[]) : [],
        };
      }),
    );

    return postsWithReplyTo;
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
        replyTo: {
          include: {
            author: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    if (!post) {
      return null;
    }

    // replyToが削除されている場合の処理
    let replyTo = post.replyTo;
    if (post.replyToId && !post.replyTo) {
      const deletedReplyTo = await this.prisma.post.findUnique({
        where: { id: post.replyToId },
        include: {
          author: true,
        },
      });
      replyTo = deletedReplyTo;
    }

    return {
      ...post,
      replyTo,
      images: post.images ? (JSON.parse(post.images) as string[]) : [],
    };
  }

  async findByUser(userId: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        authorId: userId,
        deletedAt: null, // 削除されていない投稿のみ
      },
      include: {
        author: true,
        likes: {
          include: {
            user: true,
          },
        },
        replyTo: {
          include: {
            author: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return posts.map((post) => ({
      ...post,
      images: post.images ? (JSON.parse(post.images) as string[]) : [],
    }));
  }

  async findMediaPosts() {
    const posts = await this.prisma.post.findMany({
      where: {
        images: {
          not: null,
        },
        deletedAt: null, // 削除されていない投稿のみ
      },
      include: {
        author: true,
        likes: {
          include: {
            user: true,
          },
        },
        replyTo: {
          include: {
            author: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return posts
      .filter(
        (post) =>
          post.images && (JSON.parse(post.images) as string[]).length > 0,
      )
      .map((post) => ({
        ...post,
        images: post.images ? (JSON.parse(post.images) as string[]) : [],
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
      images: like.post.images
        ? (JSON.parse(like.post.images) as string[])
        : [],
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
        replyTo: {
          include: {
            author: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });
  }

  async updateWithOwnerCheck(
    id: number,
    userId: string,
    updatePostDto: UpdatePostDto,
  ) {
    // 投稿の存在確認と所有者チェック
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new BadRequestException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const { images, ...postData } = updatePostDto;

    // コンテンツをサニタイズ
    const sanitizedPostData = {
      ...postData,
      title: postData.title ? this.sanitizeContent(postData.title) : undefined,
      content: postData.content
        ? this.sanitizeContent(postData.content)
        : undefined,
    };
    return this.prisma.post.update({
      where: { id },
      data: {
        ...sanitizedPostData,
        images: images ? JSON.stringify(images) : undefined,
      },
      include: {
        author: true,
        likes: {
          include: {
            user: true,
          },
        },
        replyTo: {
          include: {
            author: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
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

  async removeWithOwnerCheck(id: number, userId: string) {
    // 投稿の存在確認と所有者チェック
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new BadRequestException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    // 論理削除：削除時刻を設定し、内容を空にする
    return this.prisma.post.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        content: null,
        title: null,
        images: null,
      },
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

  async getReplies(postId: number) {
    const replies = await this.prisma.post.findMany({
      where: {
        replyToId: postId,
        deletedAt: null, // 削除されていない投稿のみ
      },
      include: {
        author: true,
        likes: {
          include: {
            user: true,
          },
        },
        replyTo: {
          include: {
            author: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return replies.map((reply) => ({
      ...reply,
      images: reply.images ? (JSON.parse(reply.images) as string[]) : [],
    }));
  }
}
