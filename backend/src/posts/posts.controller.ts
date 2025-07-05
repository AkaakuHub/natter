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
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|avif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // 一時的にJWT認証を無効化してauthorIdをフロントエンドから受け取る
    const imagePaths = files ? files.map((file) => file.filename) : [];
    const replyToId = createPostDto.replyToId
      ? parseInt(createPostDto.replyToId.toString())
      : undefined;
    return this.postsService.create({
      ...createPostDto,
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }

  @Post(':id/like')
  likePost(
    @Param('id', ParseIntPipe) postId: number,
    @Body('userId') userId: string,
  ) {
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
