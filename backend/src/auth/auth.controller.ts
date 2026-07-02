import { Body, Controller, Post, Req, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
import { assertInternalRequest } from './internal-request';

export interface GetTokenDto {
  userId: string;
  name: string;
  image?: string | null;
}

@Controller('auth')
export class AuthController {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  @Post('token')
  async getToken(@Req() request: Request, @Body() getTokenDto: GetTokenDto) {
    assertInternalRequest(request, this.configService);
    const { userId, name, image } = getTokenDto;

    if (!userId || !name) {
      throw new UnauthorizedException('User ID and name are required');
    }

    const userInfo = await this.prisma.user.upsert({
      where: { discordId: userId },
      update: { image: image ?? null, name },
      create: {
        discordId: userId,
        id: userId,
        image: image ?? null,
        name,
      },
      select: {
        createdAt: true,
        discordId: true,
        id: true,
        image: true,
        name: true,
        tel: true,
        updatedAt: true,
      },
    });

    const payload = {
      id: userInfo.id,
      name: userInfo.name,
      discordId: userInfo.discordId,
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
