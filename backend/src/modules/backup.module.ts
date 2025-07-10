import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BackupService } from '../services/backup.service';
import { BackupTask } from '../tasks/backup.task';
import { BackupController } from '../controllers/backup.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, AuthModule],
  providers: [BackupService, BackupTask],
  controllers: [BackupController],
  exports: [BackupService, BackupTask],
})
export class BackupModule {}
