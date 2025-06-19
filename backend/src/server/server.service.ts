import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CheckServerDto } from './dto/check-server.dto';

@Injectable()
export class ServerService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  checkServer(checkServerDto: CheckServerDto) {
    const { key } = checkServerDto;
    const passkey = this.configService.get<string>('PASSKEY');
    const now = new Date();

    console.log(`${now.toLocaleString()}: ${key}, status=${key === passkey ? "OK" : "NG"}`);
    
    if (key && key === passkey) {
      const token = this.jwtService.sign(
        { validated: true, timestamp: now.toISOString() },
        { secret: this.configService.get<string>('JWT_SECRET') }
      );
      return { status: 'OK', token };
    } else {
      throw new UnauthorizedException('Invalid key');
    }
  }
}