import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as validator from 'validator';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  private sanitizeContent(content: string): string {
    if (!content) return content;

    // HTMLエンティティをエスケープし、XSS攻撃を防ぐ
    return validator.escape(content);
  }

  async create(createPostDto: CreatePostDto) {
    console.log('Creating post with data:', createPostDto);
    const { images, authorId, replyToId, characterId, url, ...postData } =
      createPostDto;
    console.log(
      'Extracted characterId:',
      characterId,
      'type:',
      typeof characterId,
    );

    // コンテンツをサニタイズ
    const sanitizedPostData = {
      ...postData,
      title: postData.title ? this.sanitizeContent(postData.title) : undefined,
      content: postData.content
        ? this.sanitizeContent(postData.content)
        : undefined,
      url: url ? this.sanitizeContent(url) : undefined,
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

    // キャラクターIDが指定されている場合、所有者チェック
    if (characterId) {
      const character = await this.prisma.character.findFirst({
        where: { id: characterId, userId: authorId },
      });

      if (!character) {
        throw new BadRequestException(
          `Character with id ${characterId} does not exist or does not belong to the user`,
        );
      }
    }

    // リプライ先の投稿が存在するかチェック
    const numericReplyToId =
      typeof replyToId === 'string' ? parseInt(replyToId, 10) : replyToId;
    if (numericReplyToId) {
      const replyToPost = await this.prisma.post.findUnique({
        where: { id: numericReplyToId },
      });

      if (!replyToPost) {
        throw new BadRequestException(
          `Post with id ${numericReplyToId} does not exist`,
        );
      }
    }

    const post = await this.prisma.post.create({
      data: {
        ...sanitizedPostData,
        authorId,
        replyToId: numericReplyToId,
        characterId,
        images: images ? JSON.stringify(images) : null,
      },
      include: {
        author: true,
        character: true,
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

    // キャラクターの使用回数を更新
    if (characterId) {
      console.log(
        'Updating character posts count for characterId:',
        characterId,
      );
      await this.prisma.character.update({
        where: { id: characterId },
        data: {
          postsCount: {
            increment: 1,
          },
        },
      });
      console.log('Character posts count updated successfully');
    } else {
      console.log('No characterId provided, skipping posts count update');
    }

    // 返信通知を作成
    if (numericReplyToId) {
      try {
        await this.notificationsService.createReplyNotification(
          numericReplyToId,
          authorId,
        );
      } catch (error) {
        // 通知処理でエラーが発生しても投稿作成は成功扱い
        console.error('Failed to create reply notification:', error);
      }
    }

    return post;
  }

  async findAll(currentUserId?: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        deletedAt: null, // 削除されていない投稿のみ
      },
      include: {
        author: true,
        character: true,
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

    // replyToが削除されている場合の処理とキャラクター隠蔽処理
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

        // キャラクター情報の隠蔽処理
        let character = post.character;
        if (character && currentUserId !== post.authorId) {
          character = {
            ...character,
            name: '?'.repeat(character.name.length),
          };
        }

        // URL隠蔽処理（他人の投稿のURLは隠蔽）
        let url = post.url;
        if (url && currentUserId !== post.authorId) {
          url = '???';
        }

        return {
          ...post,
          replyTo,
          character,
          url,
          images: post.images ? (JSON.parse(post.images) as string[]) : [],
        };
      }),
    );

    return postsWithReplyTo;
  }

  async findOne(id: number, currentUserId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        character: true,
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

    // キャラクター情報の隠蔽処理
    let character = post.character;
    if (character && currentUserId !== post.authorId) {
      character = {
        ...character,
        name: '?'.repeat(character.name.length),
      };
    }

    // URL隠蔽処理（他人の投稿のURLは隠蔽）
    let url = post.url;
    if (url && currentUserId !== post.authorId) {
      url = '???';
    }

    return {
      ...post,
      replyTo,
      character,
      url,
      images: post.images ? (JSON.parse(post.images) as string[]) : [],
    };
  }

  async findByUser(userId: string, currentUserId?: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        authorId: userId,
        deletedAt: null, // 削除されていない投稿のみ
      },
      include: {
        author: true,
        character: true,
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

    return posts.map((post) => {
      // キャラクター情報の隠蔽処理
      let character = post.character;
      if (character && currentUserId !== post.authorId) {
        character = {
          ...character,
          name: '?'.repeat(character.name.length),
        };
      }

      return {
        ...post,
        character,
        images: post.images ? (JSON.parse(post.images) as string[]) : [],
      };
    });
  }

  async findMediaPosts(currentUserId?: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        images: {
          not: null,
        },
        deletedAt: null, // 削除されていない投稿のみ
      },
      include: {
        author: true,
        character: true,
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
      .map((post) => {
        // キャラクター情報の隠蔽処理
        let character = post.character;
        if (character && currentUserId !== post.authorId) {
          character = {
            ...character,
            name: '?'.repeat(character.name.length),
          };
        }

        return {
          ...post,
          character,
          images: post.images ? (JSON.parse(post.images) as string[]) : [],
        };
      });
  }

  async findLikedPosts(userId: string, currentUserId?: string) {
    const likedPosts = await this.prisma.like.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: true,
            character: true,
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

    return likedPosts.map((like) => {
      // キャラクター情報の隠蔽処理
      let character = like.post.character;
      if (character && currentUserId !== like.post.authorId) {
        character = {
          ...character,
          name: '?'.repeat(character.name.length),
        };
      }

      return {
        ...like.post,
        character,
        images: like.post.images
          ? (JSON.parse(like.post.images) as string[])
          : [],
      };
    });
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
        character: true,
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
        character: true,
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
    console.log(
      `[DELETE POST] Starting deletion for post ${id} by user ${userId}`,
    );

    // 投稿の存在確認と所有者チェック
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { character: true },
    });

    if (!post) {
      throw new BadRequestException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    console.log(
      `[DELETE POST] Post found with characterId: ${post.characterId}`,
    );

    // トランザクションで削除処理とキャラクター使用回数の減算を実行
    return this.prisma.$transaction(async (tx) => {
      // 論理削除：削除時刻を設定し、内容を空にする
      const deletedPost = await tx.post.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          content: null,
          title: null,
          images: null,
        },
      });

      console.log(`[DELETE POST] Post ${id} marked as deleted`);

      // キャラクターの使用回数を安全に減らす
      if (post.characterId) {
        console.log(
          `[DELETE POST] Processing character ${post.characterId} count reduction`,
        );

        // 現在の使用回数を確認してから減算
        const character = await tx.character.findUnique({
          where: { id: post.characterId },
          select: { postsCount: true },
        });

        console.log(
          `[DELETE POST] Current character postsCount: ${character?.postsCount}`,
        );

        if (character && character.postsCount > 0) {
          const newCount = character.postsCount - 1;
          console.log(`[DELETE POST] New count will be: ${newCount}`);

          if (newCount === 0) {
            // 使用回数が0になる場合、キャラクターを削除
            console.log(
              `[DELETE POST] Deleting character ${post.characterId} as count reaches 0`,
            );
            await tx.character.delete({
              where: { id: post.characterId },
            });
          } else {
            // 使用回数を1減らす
            console.log(
              `[DELETE POST] Updating character ${post.characterId} count to ${newCount}`,
            );
            await tx.character.update({
              where: { id: post.characterId },
              data: {
                postsCount: newCount,
              },
            });
          }
        } else {
          console.log(`[DELETE POST] Character not found or count already 0`);
        }
      } else {
        console.log(`[DELETE POST] No character associated with this post`);
      }

      console.log(`[DELETE POST] Transaction completed for post ${id}`);
      return deletedPost;
    });
  }

  async likePost(postId: number, userId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const existingLike = await tx.like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      if (existingLike) {
        // いいねを削除
        await tx.like.delete({
          where: {
            userId_postId: {
              userId,
              postId,
            },
          },
        });

        return { liked: false };
      } else {
        // いいねを作成
        await tx.like.create({
          data: {
            userId,
            postId,
          },
        });

        return { liked: true };
      }
    });

    // トランザクション外で通知処理を実行
    try {
      if (result.liked) {
        // 通知を作成
        await this.notificationsService.createLikeNotification(postId, userId);
      } else {
        // 通知を削除
        await this.notificationsService.removeLikeNotification(postId, userId);
      }
    } catch (error) {
      // 通知処理でエラーが発生してもいいね操作は成功扱い
      console.error('Failed to handle notification:', error);
    }

    return result;
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

  async getReplies(postId: number, currentUserId?: string) {
    const replies = await this.prisma.post.findMany({
      where: {
        replyToId: postId,
        deletedAt: null, // 削除されていない投稿のみ
      },
      include: {
        author: true,
        character: true,
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

    return replies.map((reply) => {
      // キャラクター情報の隠蔽処理
      let character = reply.character;
      if (character && currentUserId !== reply.authorId) {
        character = {
          ...character,
          name: '?'.repeat(character.name.length),
        };
      }

      return {
        ...reply,
        character,
        images: reply.images ? (JSON.parse(reply.images) as string[]) : [],
      };
    });
  }

  async getTrendingPosts(limit: number = 5, currentUserId?: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        author: true,
        character: true,
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
      orderBy: [
        {
          likes: {
            _count: 'desc',
          },
        },
        {
          createdAt: 'desc',
        },
      ],
      take: limit,
    });

    return posts.map((post) => {
      // キャラクター情報の隠蔽処理
      let character = post.character;
      if (character && currentUserId !== post.authorId) {
        character = {
          ...character,
          name: '?'.repeat(character.name.length),
        };
      }

      return {
        ...post,
        character,
        images: post.images ? (JSON.parse(post.images) as string[]) : [],
      };
    });
  }

  async searchPosts(searchTerm: string, type?: string, currentUserId?: string) {
    const searchConditions = {
      AND: [
        {
          deletedAt: null, // 削除されていない投稿のみ
        },
        {
          OR: [
            {
              content: {
                contains: searchTerm,
              },
            },
            {
              title: {
                contains: searchTerm,
              },
            },
            {
              author: {
                name: {
                  contains: searchTerm,
                },
              },
            },
          ],
        },
        // 画像フィルターが指定されている場合
        ...(type === 'media'
          ? [
              {
                images: {
                  not: null,
                },
              },
            ]
          : []),
      ],
    };

    const posts = await this.prisma.post.findMany({
      where: searchConditions,
      include: {
        author: true,
        character: true,
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
          type !== 'media' ||
          (post.images && (JSON.parse(post.images) as string[]).length > 0),
      )
      .map((post) => {
        // キャラクター情報の隠蔽処理
        let character = post.character;
        if (character && currentUserId !== post.authorId) {
          character = {
            ...character,
            name: '?'.repeat(character.name.length),
          };
        }

        return {
          ...post,
          character,
          images: post.images ? (JSON.parse(post.images) as string[]) : [],
        };
      });
  }
}
