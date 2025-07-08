import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { UsersService } from './users.service';
import * as jwt from 'jsonwebtoken';

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

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.findOrCreateByTwitterId(
      createUserDto.twitterId,
      createUserDto.name,
      createUserDto.image,
    );
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
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
