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
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  private extractUserIdFromHeader(authorization?: string): string {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer token required');
    }

    const userId = authorization.substring(7); // Remove 'Bearer ' prefix

    if (!userId) {
      throw new UnauthorizedException('Invalid user ID');
    }

    console.log('Extracted userId:', userId); // デバッグ用
    return userId;
  }

  @Post()
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
    @Headers('authorization') authorization?: string,
  ) {
    const authorId = this.extractUserIdFromHeader(authorization);
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
  ) {
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
    @Headers('authorization') authorization?: string,
  ) {
    const userId = this.extractUserIdFromHeader(authorization);
    const imagePaths = files ? files.map((file) => file.filename) : undefined;
    return this.postsService.updateWithOwnerCheck(id, userId, {
      ...updatePostDto,
      images: imagePaths,
    });
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') authorization?: string,
  ) {
    const userId = this.extractUserIdFromHeader(authorization);
    return this.postsService.removeWithOwnerCheck(id, userId);
  }

  @Post(':id/like')
  likePost(
    @Param('id', ParseIntPipe) postId: number,
    @Headers('authorization') authorization?: string,
  ) {
    const userId = this.extractUserIdFromHeader(authorization);
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
