import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // CORS configuration
  const frontendUrls = process.env.FRONTEND_URLS || 'http://localhost:3000';
  app.use(cors({
    origin: frontendUrls.split(','),
  }));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Server is running at http://localhost:${port}`);
}
bootstrap();
