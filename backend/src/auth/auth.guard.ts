import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { key } = request.body;
    const passkey = this.configService.get<string>('PASSKEY');

    if (key && key === passkey) {
      const now = new Date();
      console.log(`${now.toLocaleString()}: ${key}, status=OK`);
      return true;
    } else {
      const now = new Date();
      console.log(`${now.toLocaleString()}: ${key}, status=NG`);
      throw new UnauthorizedException('Invalid key');
    }
  }
}