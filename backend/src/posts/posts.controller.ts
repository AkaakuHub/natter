import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFiles,
  UnauthorizedException,
  UseGuards,
  Req,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { Request, Response } from 'express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  private extractUserIdFromRequest(
    req: Request & { user?: { id: string } },
  ): string {
    // JWT認証経由でユーザー情報を取得
    if (req.user?.id) {
      return req.user.id;
    }

    throw new UnauthorizedException('Authentication required');
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
      fileFilter: (_req, file, cb) => {
        // ファイルタイプチェック
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|avif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        // ファイルサイズチェック（10MB）
        if (file.size > 10 * 1024 * 1024) {
          return cb(new Error('File size exceeds 10MB limit!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request & { user?: { id: string } },
  ) {
    const authorId = this.extractUserIdFromRequest(req);
    const imagePaths = files ? files.map((file) => file.filename) : [];
    const replyToId = createPostDto.replyToId
      ? parseInt(createPostDto.replyToId.toString())
      : undefined;
    const characterId = createPostDto.characterId
      ? parseInt(createPostDto.characterId.toString())
      : undefined;
    return this.postsService.create({
      ...createPostDto,
      authorId,
      images: imagePaths,
      replyToId,
      characterId,
    });
  }

  @Get('trending')
  getTrendingPosts(
    @Query('limit') limit?: string,
    @Req() req?: Request & { user?: { id: string } },
  ) {
    const numLimit =
      limit && typeof limit === 'string' ? parseInt(limit, 10) : 5;
    const currentUserId = req?.user?.id;
    return this.postsService.getTrendingPosts(numLimit, currentUserId);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(
    @Query('type') type?: string,
    @Query('userId') userId?: string,
    @Query('search') search?: string,
    @Req() req?: Request & { user?: { id: string } },
  ) {
    const currentUserId = req?.user?.id;

    if (search) {
      return this.postsService.searchPosts(search, type, currentUserId);
    }

    if (type === 'media') {
      return this.postsService.findMediaPosts(currentUserId);
    }

    if (type === 'liked' && userId) {
      return this.postsService.findLikedPosts(userId, currentUserId);
    }

    if (userId) {
      return this.postsService.findByUser(userId, currentUserId);
    }

    return this.postsService.findAll(currentUserId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req?: Request & { user?: { id: string } },
  ) {
    const currentUserId = req?.user?.id;
    const post = await this.postsService.findOne(id, currentUserId);

    if (!post) {
      console.log(`🔍 [POST DETAIL] Post ${id} not found`);
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
      fileFilter: (_req, file, cb) => {
        // ファイルタイプチェック
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|avif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        // ファイルサイズチェック（10MB）
        if (file.size > 10 * 1024 * 1024) {
          return cb(new Error('File size exceeds 10MB limit!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request & { user?: { id: string } },
  ) {
    const userId = this.extractUserIdFromRequest(req);
    const imagePaths = files ? files.map((file) => file.filename) : undefined;
    return this.postsService.updateWithOwnerCheck(id, userId, {
      ...updatePostDto,
      images: imagePaths,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user?: { id: string } },
  ) {
    const userId = this.extractUserIdFromRequest(req);
    return this.postsService.removeWithOwnerCheck(id, userId);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  likePost(
    @Param('id', ParseIntPipe) postId: number,
    @Req() req: Request & { user?: { id: string } },
  ) {
    const userId = this.extractUserIdFromRequest(req);
    return this.postsService.likePost(postId, userId);
  }

  @Get(':id/likes')
  getPostLikes(@Param('id', ParseIntPipe) postId: number) {
    return this.postsService.getPostLikes(postId);
  }

  @Get('images/:filename')
  @UseGuards(OptionalJwtAuthGuard)
  async getImage(
    @Param('filename') filename: string,
    @Res() res: Response,
    @Req() req?: Request & { user?: { id: string } },
  ) {
    try {
      const currentUserId = req?.user?.id;
      // const userAgent = req?.headers['user-agent'] || '';
      // console.log(
      //   `🔒 [IMAGE CONTROLLER] User: ${currentUserId || 'UNAUTHENTICATED'}, File: ${filename}, UA: ${userAgent}`,
      // );

      // 🔒 SECURITY CRITICAL: 同じエンドポイントで動的に画像データを生成
      const imageBuffer: Buffer = await this.postsService.getImageBuffer(
        filename,
        currentUserId,
      );

      // キャッシュを無効化するヘッダーを設定（セキュリティ重要）
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Content-Type', 'image/jpeg');
      return res.send(imageBuffer);
    } catch (error: unknown) {
      console.error('🔒 [IMAGE CONTROLLER] ❌ Failed to serve image:', error);
      // セキュリティ上、エラー時は黒い画像を返す
      const blackImageSvg = `
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="400" fill="#000000"/>
          <text x="200" y="200" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="24">
            Access Denied
          </text>
        </svg>
      `;
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.send(blackImageSvg);
    }
  }

  @Get(':id/replies')
  @UseGuards(OptionalJwtAuthGuard)
  getReplies(
    @Param('id', ParseIntPipe) postId: number,
    @Req() req?: Request & { user?: { id: string } },
  ) {
    const currentUserId = req?.user?.id;
    return this.postsService.getReplies(postId, currentUserId);
  }

  @Get('ogp/top')
  generateTopOgImage() {
    // 画像生成を無効化し、固定パスを返す
    return { imagePath: '/og-image.png' };
  }

  @Get('ogp/:id')
  generatePostOgImage() {
    // 画像生成を無効化し、固定パスを返す
    return { imagePath: '/og-image.png' };
  }
}
