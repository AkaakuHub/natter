import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
import '../types/auth.types';

@Injectable()
export class PostOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('User not authenticated');
    }

    // 型安全にparamsにアクセス
    const params = request.params as Record<string, string | undefined>;
    const postIdStr = params.id;

    if (!postIdStr || typeof postIdStr !== 'string') {
      throw new ForbiddenException('Post ID is required');
    }

    const postId = parseInt(postIdStr, 10);
    if (isNaN(postId)) {
      throw new ForbiddenException('Invalid post ID');
    }

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== user.id) {
      throw new ForbiddenException('You can only modify your own posts');
    }

    return true;
  }
}
