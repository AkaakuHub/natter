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

    // ユーザーが存在するかチェック
    const userInfo = await this.prisma.user.findUnique({
      where: { id: userId },
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

    console.log('🔍 Payload before JWT signing:', payload);

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    console.log('✅ JWT token generated for user:', userInfo.id);
    console.log(
      '🔍 Generated token (first 100 chars):',
      token.substring(0, 100) + '...',
    );

    // トークンの構造を確認
    const parts = token.split('.');
    console.log('🔍 JWT parts count:', parts.length);
    console.log('🔍 Header part length:', parts[0]?.length);
    console.log('🔍 Payload part length:', parts[1]?.length);
    console.log('🔍 Signature part length:', parts[2]?.length);

    return {
      status: 'OK',
      token,
      user: userInfo,
    };
  }
}
