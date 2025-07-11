import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export interface GetTokenDto {
  userId: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  @Post('token')
  async getToken(@Body() getTokenDto: GetTokenDto) {
    const { userId } = getTokenDto;

    if (!userId) {
      throw new UnauthorizedException('User ID is required');
    }

    // ユーザーが存在するかチェック（userIdはtwitterIdとして扱う）
    const userInfo = await this.prisma.user.findUnique({
      where: { twitterId: userId },
      select: { id: true, name: true, twitterId: true, image: true },
    });

    if (!userInfo) {
      throw new UnauthorizedException('User not found');
    }

    // JWTトークンを生成
    const payload = {
      id: userInfo.id,
      name: userInfo.name,
      twitterId: userInfo.twitterId,
      image: userInfo.image ?? undefined,
      validated: true,
      timestamp: new Date().toISOString(),
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    return {
      status: 'OK',
      token,
      user: userInfo,
    };
  }
}
