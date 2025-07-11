import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServerModule } from './server/server.module';
import { PostsModule } from './posts/posts.module';
import { FollowsModule } from './follows/follows.module';
import { CharactersModule } from './characters/characters.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DbBackupService } from './services/db-backup.service';
import { BackupTask } from './tasks/backup.task';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    ServerModule,
    PostsModule,
    FollowsModule,
    CharactersModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, DbBackupService, BackupTask],
})
export class AppModule {}
