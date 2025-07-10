import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
// import { BackupModule } from './modules/backup.module'; // 後で有効化

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ServerModule,
    PostsModule,
    FollowsModule,
    CharactersModule,
    NotificationsModule,
    // BackupModule, // 後で有効化
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
