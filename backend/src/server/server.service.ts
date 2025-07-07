import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CheckServerDto } from './dto/check-server.dto';

@Injectable()
export class ServerService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async checkServer(checkServerDto: CheckServerDto) {
    const { key, userId } = checkServerDto;
    const passkey = this.configService.get<string>('PASSKEY');
    const now = new Date();

    console.log(
      `${now.toLocaleString()}: ${key}, status=${key === passkey ? 'OK' : 'NG'}`,
    );

    if (key && key === passkey) {
      let userInfo: {
        id: string;
        name: string;
        twitterId: string;
        image: string | null;
      } | null = null;

      // userIdが提供されている場合、ユーザー情報を取得
      if (userId) {
        userInfo = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, twitterId: true, image: true },
        });
      }

      const payload = userInfo
        ? {
            id: userInfo.id,
            name: userInfo.name,
            twitterId: userInfo.twitterId,
            image: userInfo.image ?? undefined,
            validated: true,
            timestamp: now.toISOString(),
          }
        : { validated: true, timestamp: now.toISOString() };

      const token = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return { status: 'OK', token, user: userInfo };
    } else {
      throw new UnauthorizedException('Invalid key');
    }
  }
}
