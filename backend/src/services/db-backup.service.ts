import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DbBackupService {
  private readonly logger = new Logger(DbBackupService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');
  private readonly dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

  constructor() {
    // バックアップディレクトリが存在しない場合は作成
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * dev.dbファイルの物理コピーバックアップを実行
   */
  performDbBackup(): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19); // YYYY-MM-DDTHH-MM-SS
    const backupFileName = `dev-${timestamp}.db`;
    const backupPath = path.join(this.backupDir, backupFileName);

    try {
      this.logger.log('🔄 Starting dev.db file backup...');

      // dev.dbファイルが存在するかチェック
      if (!fs.existsSync(this.dbPath)) {
        throw new Error(`Database file not found: ${this.dbPath}`);
      }

      // ファイルをコピー
      fs.copyFileSync(this.dbPath, backupPath);

      const stats = fs.statSync(backupPath);
      this.logger.log(`✅ Database backup completed: ${backupFileName}`);
      this.logger.log(
        `📊 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`,
      );

      // 古いバックアップファイルを削除（1年以上前）
      this.cleanOldDbBackups();

      return backupPath;
    } catch (error) {
      this.logger.error('❌ Database backup failed:', error);
      throw new Error(`Database backup failed: ${(error as Error).message}`);
    }
  }

  /**
   * 古いdev.dbバックアップファイルを削除（1年1以上前）
   */
  private cleanOldDbBackups(): void {
    try {
      const files = fs.readdirSync(this.backupDir);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      for (const file of files) {
        if (file.startsWith('dev-') && file.endsWith('.db')) {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);

          if (stats.mtime < oneYearAgo) {
            fs.unlinkSync(filePath);
            this.logger.log(`🗑️ Deleted old database backup: ${file}`);
          }
        }
      }
    } catch (error) {
      this.logger.warn('⚠️ Failed to clean old database backups:', error);
    }
  }

  /**
   * dev.dbバックアップファイルの一覧を取得
   */
  getDbBackupList(): Array<{
    filename: string;
    size: number;
    date: Date;
  }> {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backupFiles: Array<{
        filename: string;
        size: number;
        date: Date;
      }> = [];

      for (const file of files) {
        if (file.startsWith('dev-') && file.endsWith('.db')) {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);

          backupFiles.push({
            filename: file,
            size: stats.size,
            date: stats.mtime,
          });
        }
      }

      return backupFiles.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      this.logger.error('Failed to get database backup list:', error);
      return [];
    }
  }
}
