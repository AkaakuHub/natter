import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import '../types/auth.types';

// JWTペイロードの型定義
export interface JwtPayload {
  id: string;
  twitterId: string;
  name: string;
  image?: string;
  validated?: boolean;
  timestamp?: string;
}

// ExpressのRequestインターフェースを拡張
declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const rawPayload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }) as unknown;

      if (this.isValidJwtPayload(rawPayload)) {
        const payload: JwtPayload = {
          id: rawPayload.id as string,
          twitterId: rawPayload.twitterId as string,
          name: rawPayload.name as string,
          image: rawPayload.image as string | undefined,
          validated: rawPayload.validated as boolean | undefined,
          timestamp: rawPayload.timestamp as string | undefined,
        };

        request.user = payload;
        return true;
      }

      throw new UnauthorizedException('Invalid token payload');
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private isValidJwtPayload(payload: unknown): payload is Record<string, any> {
    if (typeof payload !== 'object' || payload === null) {
      return false;
    }

    const obj = payload as Record<string, unknown>;
    return (
      typeof obj.id === 'string' &&
      typeof obj.twitterId === 'string' &&
      typeof obj.name === 'string'
    );
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // 型安全にヘッダーにアクセス
    const headers = request.headers as Record<
      string,
      string | string[] | undefined
    >;
    const authHeader = headers.authorization;

    if (typeof authHeader !== 'string') {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
