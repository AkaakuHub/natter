import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
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

  // Static files for uploads - DISABLED for security (use dynamic endpoints instead)
  // app.useStaticAssets(join(process.cwd(), 'uploads'), {
  //   prefix: '/uploads/',
  // });

  // CORS configuration
  const frontendUrls =
    process.env.FRONTEND_URLS || 'http://localhost:3000,http://127.0.0.1:3000';
  app.use(
    cors({
      origin: frontendUrls.split(','),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Retry-Attempt'],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 200,
    }),
  );

  // Additional CORS headers for preflight
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type,Authorization,X-Retry-Attempt',
    );
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    next();
  });

  // OGP生成を無効化するミドルウェア
  app.use((req: Request, res: Response, next: NextFunction) => {
    // APIエンドポイントでOGP生成を無効化
    if (
      req.path.startsWith('/posts') ||
      req.path.startsWith('/users') ||
      req.path.startsWith('/auth') ||
      req.path.startsWith('/server') ||
      req.path.startsWith('/follows')
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

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port);
  console.log(`Server is running at http://localhost:${port}`);

  // Handle process termination
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    void app.close().then(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    void app.close().then(() => process.exit(0));
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}
void bootstrap();
