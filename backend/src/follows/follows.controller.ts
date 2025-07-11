import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { Request } from 'express';

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':userId')
  @UseGuards(JwtAuthGuard)
  async followUser(
    @Param('userId') userId: string,
    @Req() req: Request & { user?: { id: string } },
  ) {
    const followerId = req.user?.id;
    if (!followerId) {
      throw new Error('Authentication required');
    }
    return this.followsService.followUser(followerId, userId);
  }

  @Delete(':userId')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(
    @Param('userId') userId: string,
    @Req() req: Request & { user?: { id: string } },
  ) {
    const followerId = req.user?.id;
    if (!followerId) {
      throw new Error('Authentication required');
    }
    return this.followsService.unfollowUser(followerId, userId);
  }

  @Get('following')
  @UseGuards(OptionalJwtAuthGuard)
  async getFollowing(
    @Req() req: Request & { user?: { id: string } },
    @Query('userId') userId?: string,
  ) {
    const targetUserId = userId || req.user?.id;
    if (!targetUserId) {
      throw new Error('User ID required');
    }
    return this.followsService.getFollowing(targetUserId);
  }

  @Get('followers')
  @UseGuards(OptionalJwtAuthGuard)
  async getFollowers(
    @Req() req: Request & { user?: { id: string } },
    @Query('userId') userId?: string,
  ) {
    const targetUserId = userId || req.user?.id;
    if (!targetUserId) {
      throw new Error('User ID required');
    }
    return this.followsService.getFollowers(targetUserId);
  }

  @Get('status/:userId')
  @UseGuards(JwtAuthGuard)
  async getFollowStatus(
    @Param('userId') userId: string,
    @Req() req: Request & { user?: { id: string } },
  ) {
    const followerId = req.user?.id;
    if (!followerId) {
      throw new Error('Authentication required');
    }
    return this.followsService.getFollowStatus(followerId, userId);
  }
}
