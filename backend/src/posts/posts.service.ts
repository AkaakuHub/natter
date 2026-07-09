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
import { ImageProcessingService } from '../services/image-processing.service';
import { SecurityService } from '../services/security.service';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private imageProcessingService: ImageProcessingService,
    private securityService: SecurityService,
  ) {}

  private sanitizeContent(content: string): string {
    if (!content) return content;

    // HTMLエンティティをエスケープし、XSS攻撃を防ぐ
    // ただし、URLは適切に保持する
    return validator.escape(content);
  }

  private sanitizeContentPreservingUrls(content: string): string {
    if (!content) return content;

    // URL検出の正規表現パターン
    const urlPattern = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;

    // URLを一時的にプレースホルダーに置換
    const urls: string[] = [];
    const contentWithPlaceholders = content.replace(urlPattern, (match) => {
      urls.push(match);
      return `__URL_PLACEHOLDER_${urls.length - 1}__`;
    });

    // プレースホルダーを含むコンテンツをサニタイズ
    const sanitizedContent = validator.escape(contentWithPlaceholders);

    // プレースホルダーを元のURLに戻す
    return sanitizedContent.replace(
      /__URL_PLACEHOLDER_(\d+)__/g,
      (match, index: string) => {
        return urls[parseInt(index, 10)] || match;
      },
    );
  }

  async create(createPostDto: CreatePostDto) {
    const {
      images,
      authorId,
      replyToId,
      characterId,
      url,
      imagesPublic,
      ...postData
    } = createPostDto;
    // コンテンツをサニタイズ（URLを保護）
    const sanitizedPostData = {
      ...postData,
      title: postData.title ? this.sanitizeContent(postData.title) : undefined,
      content: postData.content
        ? this.sanitizeContentPreservingUrls(postData.content)
        : undefined,
      url: url ? this.sanitizeContent(url) : undefined,
      imagesPublic: imagesPublic || false, // デフォルトは非公開
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
      await this.prisma.character.update({
        where: { id: characterId },
        data: {
          postsCount: {
            increment: 1,
          },
        },
      });
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
        const character = await this.securityService.hideCharacterNameIfNeeded(
          post.character,
          currentUserId,
          post.authorId,
        );

        // URL隠蔽処理（他人の投稿のURLは隠蔽）
        const url = await this.securityService.hideUrlIfNeeded(
          post.url,
          currentUserId,
          post.authorId,
        );

        // 画像処理は動的にエンドポイントで行うため、ここでは元のファイル名のまま返す
        const images = post.images ? (JSON.parse(post.images) as string[]) : [];

        return {
          ...post,
          replyTo,
          character,
          url,
          images,
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
    const character = await this.securityService.hideCharacterNameIfNeeded(
      post.character,
      currentUserId,
      post.authorId,
    );

    // URL隠蔽処理（他人の投稿のURLは隠蔽）
    const url = await this.securityService.hideUrlIfNeeded(
      post.url,
      currentUserId,
      post.authorId,
    );

    // 画像処理は動的にエンドポイントで行うため、ここでは元のファイル名のまま返す
    const images = post.images ? (JSON.parse(post.images) as string[]) : [];

    return {
      ...post,
      replyTo,
      character,
      url,
      images,
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

    return Promise.all(
      posts.map(async (post) => {
        // キャラクター情報の隠蔽処理
        const character = await this.securityService.hideCharacterNameIfNeeded(
          post.character,
          currentUserId,
          post.authorId,
        );

        return {
          ...post,
          character,
          images: post.images ? (JSON.parse(post.images) as string[]) : [],
        };
      }),
    );
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

    const filteredPosts = posts
      .filter(
        (post) =>
          post.images && (JSON.parse(post.images) as string[]).length > 0,
      )
      .map((post) =>
        (async () => {
          // キャラクター情報の隠蔽処理
          const character =
            await this.securityService.hideCharacterNameIfNeeded(
              post.character,
              currentUserId,
              post.authorId,
            );

          return {
            ...post,
            character,
            images: post.images ? (JSON.parse(post.images) as string[]) : [],
          };
        })(),
      );

    return Promise.all(filteredPosts);
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

    return Promise.all(
      likedPosts.map(async (like) => {
        // キャラクター情報の隠蔽処理
        const character = await this.securityService.hideCharacterNameIfNeeded(
          like.post.character,
          currentUserId,
          like.post.authorId,
        );

        return {
          ...like.post,
          character,
          images: like.post.images
            ? (JSON.parse(like.post.images) as string[])
            : [],
        };
      }),
    );
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const updateData = { ...updatePostDto };
    delete updateData.existingImages;
    const { images, ...postData } = updateData;
    const characterId =
      postData.characterId === ''
        ? null
        : typeof postData.characterId === 'string'
          ? parseInt(postData.characterId, 10)
          : postData.characterId;
    return this.prisma.post.update({
      where: { id },
      data: {
        ...postData,
        characterId,
        url:
          postData.url === ''
            ? null
            : postData.url
              ? this.sanitizeContent(postData.url)
              : undefined,
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

    const updateData = { ...updatePostDto };
    delete updateData.existingImages;
    const { images, ...postData } = updateData;
    const characterId =
      postData.characterId === ''
        ? null
        : typeof postData.characterId === 'string'
          ? parseInt(postData.characterId, 10)
          : postData.characterId;

    if (characterId) {
      const character = await this.prisma.character.findFirst({
        where: { id: characterId, userId },
      });

      if (!character) {
        throw new BadRequestException(
          'Character does not exist or does not belong to the user',
        );
      }
    }

    // コンテンツをサニタイズ（URLを保護）
    const sanitizedPostData = {
      ...postData,
      characterId,
      title: postData.title ? this.sanitizeContent(postData.title) : undefined,
      content: postData.content
        ? this.sanitizeContentPreservingUrls(postData.content)
        : undefined,
      url:
        postData.url === ''
          ? null
          : postData.url
            ? this.sanitizeContent(postData.url)
            : undefined,
    };
    const updatedPost = await this.prisma.post.update({
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

    if (characterId !== undefined && post.characterId !== characterId) {
      if (post.characterId) {
        await this.prisma.character.update({
          where: { id: post.characterId },
          data: {
            postsCount: {
              decrement: post.characterId ? 1 : 0,
            },
          },
        });
      }
      if (characterId) {
        await this.prisma.character.update({
          where: { id: characterId },
          data: {
            postsCount: {
              increment: 1,
            },
          },
        });
      }
    }

    return updatedPost;
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
      include: { character: true },
    });

    if (!post) {
      throw new BadRequestException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

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

      // キャラクターの使用回数を安全に減らす
      if (post.characterId) {
        // 現在の使用回数を確認してから減算
        const character = await tx.character.findUnique({
          where: { id: post.characterId },
          select: { postsCount: true },
        });

        if (character && character.postsCount > 0) {
          const newCount = character.postsCount - 1;
          if (newCount === 0) {
            // 使用回数が0になる場合、キャラクターを削除
            await tx.character.delete({
              where: { id: post.characterId },
            });
          } else {
            // 使用回数を1減らす
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

    return Promise.all(
      replies.map(async (reply) => {
        // キャラクター情報の隠蔽処理
        const character = await this.securityService.hideCharacterNameIfNeeded(
          reply.character,
          currentUserId,
          reply.authorId,
        );

        return {
          ...reply,
          character,
          images: reply.images ? (JSON.parse(reply.images) as string[]) : [],
        };
      }),
    );
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

    return Promise.all(
      posts.map(async (post) => {
        // キャラクター情報の隠蔽処理
        const character = await this.securityService.hideCharacterNameIfNeeded(
          post.character,
          currentUserId,
          post.authorId,
        );

        return {
          ...post,
          character,
          images: post.images ? (JSON.parse(post.images) as string[]) : [],
        };
      }),
    );
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

    const filteredPosts = posts
      .filter(
        (post) =>
          type !== 'media' ||
          (post.images && (JSON.parse(post.images) as string[]).length > 0),
      )
      .map((post) =>
        (async () => {
          // キャラクター情報の隠蔽処理
          const character =
            await this.securityService.hideCharacterNameIfNeeded(
              post.character,
              currentUserId,
              post.authorId,
            );

          return {
            ...post,
            character,
            images: post.images ? (JSON.parse(post.images) as string[]) : [],
          };
        })(),
      );

    return Promise.all(filteredPosts);
  }

  /**
   * 画像バッファを取得（同じエンドポイントで動的に処理）
   * 🔒 SECURITY CRITICAL: 他人からは絶対に処理済み画像のみを返す
   */
  async getImageBuffer(
    filename: string,
    currentUserId?: string,
  ): Promise<Buffer> {
    try {
      // ファイル名から画像を含む投稿を検索
      const post = await this.prisma.post.findFirst({
        where: {
          images: {
            contains: filename,
          },
        },
        include: {
          author: true,
        },
      });

      // 元画像を返す条件を統合
      const shouldReturnOriginal =
        (await this.securityService.shouldRevealSecrets()) ||
        (post && currentUserId && currentUserId === post.authorId) ||
        (post && post.imagesPublic);

      if (shouldReturnOriginal) {
        const originalPath = path.join(process.cwd(), 'uploads', filename);
        return await fs.readFile(originalPath);
      }

      // その他の場合は処理済み画像を返す
      return await this.imageProcessingService.getBlurredImageBuffer(filename);
    } catch (error) {
      console.error('🔒 [IMAGE BUFFER] ERROR:', error);
      // エラー時の処理もIS_REVEADED_SECRETSを考慮
      if (await this.securityService.shouldRevealSecrets()) {
        try {
          const originalPath = path.join(process.cwd(), 'uploads', filename);
          return await fs.readFile(originalPath);
        } catch (readError) {
          console.error(
            'Failed to read original image on error fallback:',
            readError,
          );
        }
      }
      // エラー時も処理済み画像を返す（セキュリティ重要）
      return await this.imageProcessingService.getBlurredImageBuffer(filename);
    }
  }

  /**
   * 画像パスを取得（認証状態に応じて動的処理）
   */
  async getProcessedImagePath(
    filename: string,
    currentUserId?: string,
  ): Promise<string> {
    try {
      // ファイル名から画像を含む投稿を検索
      const post = await this.prisma.post.findFirst({
        where: {
          images: {
            contains: filename,
          },
        },
        include: {
          author: true,
        },
      });

      // 元画像パスを返す条件を統合
      const shouldReturnOriginal =
        (await this.securityService.shouldRevealSecrets()) ||
        (post && currentUserId && currentUserId === post.authorId) ||
        (post && post.imagesPublic);

      if (shouldReturnOriginal) {
        return filename;
      }

      // その他の場合は処理済み画像パスを返す
      if (!post) {
        // 投稿が見つからない場合は処理済み画像を返す（セキュリティのため）
        const processedImagePath =
          await this.imageProcessingService.applyBlurAndMosaic(filename);
        return processedImagePath;
      }

      const processedImagePath =
        await this.imageProcessingService.applyBlurAndMosaic(filename);
      return processedImagePath;
    } catch (error) {
      console.error('Failed to process image request:', error);
      // エラー時の処理もIS_REVEADED_SECRETSを考慮
      if (await this.securityService.shouldRevealSecrets()) {
        return filename;
      }
      // エラー時も処理済み画像を返す（セキュリティのため）
      try {
        const processedImagePath =
          await this.imageProcessingService.applyBlurAndMosaic(filename);
        return processedImagePath;
      } catch (processingError) {
        console.error(
          'Failed to process image on error fallback:',
          processingError,
        );
        // セキュリティ上、エラー時も元画像は絶対に返さない
        throw new Error('Image processing failed completely');
      }
    }
  }
}
