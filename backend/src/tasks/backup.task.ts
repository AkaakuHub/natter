import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DbBackupService } from '../services/db-backup.service';

@Injectable()
export class BackupTask {
  private readonly logger = new Logger(BackupTask.name);

  constructor(private dbBackupService: DbBackupService) {}

  /**
   * 朝8時に自動バックアップ実行
   */
  @Cron('0 8 * * *')
  morningBackup() {
    this.logger.log('🌅 Starting morning backup (8:00 AM)...');
    try {
      this.dbBackupService.performDbBackup();
      this.logger.log('✅ Morning database backup completed successfully');
    } catch (error) {
      this.logger.error('❌ Morning database backup failed:', error);
    }
  }

  /**
   * 夜8時に自動バックアップ実行
   */
  @Cron('0 20 * * *')
  eveningBackup() {
    this.logger.log('🌆 Starting evening backup (8:00 PM)...');
    try {
      this.dbBackupService.performDbBackup();
      this.logger.log('✅ Evening database backup completed successfully');
    } catch (error) {
      this.logger.error('❌ Evening database backup failed:', error);
    }
  }

  /**
   * 手動データベースファイルバックアップ実行
   */
  performManualBackup() {
    this.logger.log('🔧 Starting manual database backup...');
    try {
      const backupPath = this.dbBackupService.performDbBackup();
      this.logger.log('✅ Manual database backup completed successfully');
      return backupPath;
    } catch (error) {
      this.logger.error('❌ Manual database backup failed:', error);
      throw error;
    }
  }
}
