import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { FollowsModule } from './follows/follows.module';
import { CharactersModule } from './characters/characters.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MetadataModule } from './metadata/metadata.module';
import { AdminModule } from './admin/admin.module';
import { DbBackupService } from './services/db-backup.service';
import { BackupTask } from './tasks/backup.task';
import { MetadataTask } from './tasks/metadata.task';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
    FollowsModule,
    CharactersModule,
    NotificationsModule,
    MetadataModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, DbBackupService, BackupTask, MetadataTask],
})
export class AppModule {}
