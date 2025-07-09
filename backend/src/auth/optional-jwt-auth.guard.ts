import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from './jwt-auth.guard';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      // トークンがない場合でも認証なしで続行
      return true;
    }

    // JWTトークンを検証
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
      }
    } catch (error) {
      // 認証に失敗してもエラーは投げず、認証なしで続行
      console.log(
        '⚠️ OptionalJwtAuthGuard - JWT verification failed, continuing without auth:',
        error,
      );
    }

    return true;
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
