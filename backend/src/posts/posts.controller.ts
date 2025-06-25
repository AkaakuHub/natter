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
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    // 一時的にJWT認証を無効化してauthorIdをフロントエンドから受け取る
    return this.postsService.create(createPostDto);
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
      return this.postsService.findLikedPosts(parseInt(userId));
    }

    if (userId) {
      return this.postsService.findByUser(parseInt(userId));
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
    @Body('userId', ParseIntPipe) userId: number,
  ) {
    return this.postsService.likePost(postId, userId);
  }

  @Get(':id/likes')
  getPostLikes(@Param('id', ParseIntPipe) postId: number) {
    return this.postsService.getPostLikes(postId);
  }
}
