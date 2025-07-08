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
  Headers,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

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
    return this.postsService.create({
      ...createPostDto,
      authorId,
      images: imagePaths,
      replyToId,
    });
  }

  @Get()
  async findAll(
    @Query('type') type?: string,
    @Query('userId') userId?: string,
    @Query('search') search?: string,
  ) {
    if (search) {
      return this.postsService.searchPosts(search, type);
    }

    if (type === 'media') {
      return this.postsService.findMediaPosts();
    }

    if (type === 'liked' && userId) {
      return this.postsService.findLikedPosts(userId);
    }

    if (userId) {
      return this.postsService.findByUser(userId);
    }

    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
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
  getImage(@Param('filename') filename: string) {
    return { url: `/uploads/${filename}` };
  }

  @Get(':id/replies')
  getReplies(@Param('id', ParseIntPipe) postId: number) {
    return this.postsService.getReplies(postId);
  }
}
