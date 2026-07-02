import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

export function assertInternalRequest(
  request: Request,
  configService: ConfigService,
): void {
  const expected = configService.get<string>('INTERNAL_API_SECRET');
  if (!expected) {
    throw new UnauthorizedException('Internal API secret is not configured');
  }
  if (request.header('x-internal-api-secret') !== expected) {
    throw new UnauthorizedException('Unauthorized internal request');
  }
}
