import { Module, forwardRef } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PostOwnerGuard } from '../auth/post-owner.guard';
import { NotificationsModule } from '../notifications/notifications.module';
import { ImageProcessingService } from '../services/image-processing.service';
import { OgImageService } from '../services/og-image.service';

@Module({
  imports: [PrismaModule, AuthModule, forwardRef(() => NotificationsModule)],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostOwnerGuard,
    ImageProcessingService,
    OgImageService,
  ],
  exports: [PostsService],
})
export class PostsModule {}
