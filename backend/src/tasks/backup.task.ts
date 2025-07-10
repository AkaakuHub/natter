import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BackupService } from '../services/backup.service';

@Injectable()
export class BackupTask {
  private readonly logger = new Logger(BackupTask.name);

  constructor(private backupService: BackupService) {}

  /**
   * 朝8時に自動バックアップ実行
   */
  @Cron('0 8 * * *')
  async morningBackup() {
    this.logger.log('🌅 Starting morning backup (8:00 AM)...');
    try {
      await this.backupService.performBackup();
      this.logger.log('✅ Morning backup completed successfully');
    } catch (error) {
      this.logger.error('❌ Morning backup failed:', error);
    }
  }

  /**
   * 夜8時に自動バックアップ実行
   */
  @Cron('0 20 * * *')
  async eveningBackup() {
    this.logger.log('🌆 Starting evening backup (8:00 PM)...');
    try {
      await this.backupService.performBackup();
      this.logger.log('✅ Evening backup completed successfully');
    } catch (error) {
      this.logger.error('❌ Evening backup failed:', error);
    }
  }

  /**
   * 手動バックアップ実行
   */
  async performManualBackup() {
    this.logger.log('🔧 Starting manual backup...');
    try {
      const backupPath = await this.backupService.performBackup();
      this.logger.log('✅ Manual backup completed successfully');
      return backupPath;
    } catch (error) {
      this.logger.error('❌ Manual backup failed:', error);
      throw error;
    }
  }
}
