import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  NotFoundException,
  Headers,
  UnauthorizedException,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  twitterId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  image?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  image?: string;
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    console.log('🔍 Received user creation request:', createUserDto);
    return this.usersService.findOrCreateByTwitterId(
      createUserDto.twitterId,
      createUserDto.name,
      createUserDto.image,
    );
  }

  @Get('recommended')
  @UseGuards(JwtAuthGuard)
  getRecommendedUsers(
    @Req() req: Request & { user?: { id: string } },
    @Query('limit') limit?: string,
  ) {
    const numLimit = limit ? parseInt(limit, 10) : 5;
    const excludeUserId = req?.user?.id;
    return this.usersService.getRecommendedUsers(numLimit, excludeUserId);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(@Param('id') id: string) {
    console.log(`🔍 [USER DETAIL] Fetching user ${id}`);
    const user = await this.usersService.findOne(id);

    if (!user) {
      console.log(`🔍 [USER DETAIL] User ${id} not found`);
      throw new NotFoundException('User not found');
    }

    console.log(`🔍 [USER DETAIL] ✅ User ${id} found: "${user.name}"`);
    return user;
  }

  @Get('twitter/:twitterId')
  async findByTwitterId(@Param('twitterId') twitterId: string) {
    const user = await this.usersService.findByTwitterId(twitterId);
    if (!user) {
      throw new NotFoundException(
        `User with Twitter ID ${twitterId} not found`,
      );
    }
    return user;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.updateUser(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  @Post('verify-session')
  async verifySession(
    @Body() body: { twitterId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer token required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const jwtSecret = this.configService.get<string>('NEXTAUTH_SECRET');

    if (!jwtSecret) {
      throw new UnauthorizedException('JWT secret not configured');
    }

    try {
      // NextAuth.jsのJWTトークンを検証
      const decoded = jwt.verify(token, jwtSecret) as {
        exp?: number;
        iat?: number;
        twitterId?: string;
        name?: string;
      };

      // トークンの有効期限をチェック
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        throw new UnauthorizedException('Token expired');
      }

      // TwitterIDが一致するかチェック
      if (decoded.twitterId !== body.twitterId) {
        throw new UnauthorizedException('Token TwitterID mismatch');
      }

      // ユーザー情報を取得
      const user = await this.usersService.findByTwitterId(body.twitterId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        id: user.id,
        twitterId: user.twitterId,
        name: user.name,
        verified: true,
        tokenValid: true,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid JWT token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('JWT token expired');
      }
      if (error instanceof jwt.NotBeforeError) {
        throw new UnauthorizedException('JWT token not active');
      }

      console.error('JWT verification error:', error);
      throw new UnauthorizedException('Session verification failed');
    }
  }
}
