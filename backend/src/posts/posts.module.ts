import { Module, forwardRef } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PostOwnerGuard } from '../auth/post-owner.guard';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, AuthModule, forwardRef(() => NotificationsModule)],
  controllers: [PostsController],
  providers: [PostsService, PostOwnerGuard],
  exports: [PostsService],
})
export class PostsModule {}
