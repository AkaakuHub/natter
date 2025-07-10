import { Controller, Post, Get, UseGuards, Logger } from '@nestjs/common';
import { BackupService } from '../services/backup.service';
import { BackupTask } from '../tasks/backup.task';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('backup')
@UseGuards(JwtAuthGuard)
export class BackupController {
  private readonly logger = new Logger(BackupController.name);

  constructor(
    private backupService: BackupService,
    private backupTask: BackupTask,
  ) {}

  /**
   * 手動バックアップ実行
   */
  @Post('create')
  async createBackup() {
    this.logger.log('📋 Manual backup requested');
    try {
      const backupPath = await this.backupTask.performManualBackup();
      return {
        success: true,
        message: 'Backup created successfully',
        backup_path: backupPath,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Manual backup failed:', error);
      return {
        success: false,
        message: 'Backup failed',
        error: (error as Error).message,
      };
    }
  }

  /**
   * バックアップファイル一覧取得
   */
  @Get('list')
  getBackupList() {
    try {
      const backups = this.backupService.getBackupList();
      return {
        success: true,
        backups,
        total_count: backups.length,
      };
    } catch (error) {
      this.logger.error('Failed to get backup list:', error);
      return {
        success: false,
        message: 'Failed to get backup list',
        error: (error as Error).message,
      };
    }
  }

  /**
   * バックアップシステムのステータス取得
   */
  @Get('status')
  getBackupStatus() {
    try {
      const backups = this.backupService.getBackupList();
      const latestBackup = backups[0];

      return {
        success: true,
        system_status: 'active',
        latest_backup: latestBackup
          ? {
              filename: latestBackup.filename,
              date: latestBackup.date,
              size_mb:
                Math.round((latestBackup.size / 1024 / 1024) * 100) / 100,
            }
          : null,
        total_backups: backups.length,
        next_scheduled: [
          { name: 'Morning Backup', time: '08:00' },
          { name: 'Evening Backup', time: '20:00' },
        ],
      };
    } catch (error) {
      return {
        success: false,
        system_status: 'error',
        error: (error as Error).message,
      };
    }
  }
}
