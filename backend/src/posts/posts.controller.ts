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
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  async findAll(@Query('type') type?: string, @Query('userId') userId?: string) {
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
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
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