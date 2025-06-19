import { Module } from '@nestjs/common';
import { ServerController } from './server.controller';
import { ServerService } from './server.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ServerController],
  providers: [ServerService],
})
export class ServerModule {}