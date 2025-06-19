import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CheckServerDto } from './dto/check-server.dto';

@Injectable()
export class ServerService {
  constructor(private configService: ConfigService) {}

  checkServer(checkServerDto: CheckServerDto) {
    const { key } = checkServerDto;
    const passkey = this.configService.get<string>('PASSKEY');
    const now = new Date();

    console.log(`${now.toLocaleString()}: ${key}, status=${key === passkey ? "OK" : "NG"}`);
    
    if (key && key === passkey) {
      return { status: 'OK' };
    } else {
      throw new UnauthorizedException('Invalid key');
    }
  }
}