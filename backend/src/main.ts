import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cors from 'cors';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Static files for uploads
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // CORS configuration
  const frontendUrls = process.env.FRONTEND_URLS || 'http://localhost:3000';
  app.use(
    cors({
      origin: frontendUrls.split(','),
    }),
  );

  // OGP生成を無効化するミドルウェア
  app.use((req: Request, res: Response, next: NextFunction) => {
    // APIエンドポイントでOGP生成を無効化
    if (
      req.path.startsWith('/posts') ||
      req.path.startsWith('/users') ||
      req.path.startsWith('/auth') ||
      req.path.startsWith('/server')
    ) {
      res.setHeader(
        'X-Robots-Tag',
        'noindex, nofollow, noarchive, nosnippet, noimageindex',
      );
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    next();
  });

  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`Server is running at http://localhost:${port}`);
}
void bootstrap();
