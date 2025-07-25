import { Module, forwardRef } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PostOwnerGuard } from '../auth/post-owner.guard';
import { NotificationsModule } from '../notifications/notifications.module';
import { ImageProcessingService } from '../services/image-processing.service';
import { SecurityService } from '../services/security.service';
import { OgImageService } from '../services/og-image.service';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    forwardRef(() => NotificationsModule),
    AdminModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostOwnerGuard,
    ImageProcessingService,
    SecurityService,
    OgImageService,
  ],
  exports: [PostsService],
})
export class PostsModule {}
