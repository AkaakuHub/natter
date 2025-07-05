import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Static files for uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // CORS configuration
  const frontendUrls = process.env.FRONTEND_URLS || 'http://localhost:3000';
  app.use(
    cors({
      origin: frontendUrls.split(','),
    }),
  );

  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`Server is running at http://localhost:${port}`);
}
void bootstrap();
