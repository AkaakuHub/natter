import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor(private prisma: PrismaService) {
    // バックアップディレクトリが存在しない場合は作成
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * データベースの完全バックアップを実行
   */
  async performBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `natter-backup-${timestamp}.json`;
    const backupPath = path.join(this.backupDir, backupFileName);

    try {
      this.logger.log('🔄 Starting database backup...');

      // 全てのテーブルデータを取得
      const data = {
        users: await this.prisma.user.findMany(),
        posts: await this.prisma.post.findMany(),
        follows: await this.prisma.follow.findMany(),
        likes: await this.prisma.like.findMany(),
        characters: await this.prisma.character.findMany(),
        notifications: await this.prisma.notification.findMany(),
        backup_info: {
          timestamp: new Date().toISOString(),
          version: '1.0',
          total_users: await this.prisma.user.count(),
          total_posts: await this.prisma.post.count(),
          total_follows: await this.prisma.follow.count(),
          total_likes: await this.prisma.like.count(),
        },
      };

      // JSONファイルとして保存
      fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));

      this.logger.log(`✅ Backup completed successfully: ${backupFileName}`);
      this.logger.log(
        `📊 Backup stats: ${data.backup_info.total_users} users, ${data.backup_info.total_posts} posts`,
      );

      // 古いバックアップファイルを削除（7日以上前）
      this.cleanOldBackups();

      return backupPath;
    } catch (error) {
      this.logger.error('❌ Backup failed:', error);
      throw new Error(`Backup failed: ${(error as Error).message}`);
    }
  }

  /**
   * 古いバックアップファイルを削除（7日以上前）
   */
  private cleanOldBackups(): void {
    try {
      const files = fs.readdirSync(this.backupDir);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      for (const file of files) {
        if (file.startsWith('natter-backup-') && file.endsWith('.json')) {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);

          if (stats.mtime < sevenDaysAgo) {
            fs.unlinkSync(filePath);
            this.logger.log(`🗑️ Deleted old backup: ${file}`);
          }
        }
      }
    } catch (error) {
      this.logger.warn('⚠️ Failed to clean old backups:', error);
    }
  }

  /**
   * バックアップファイルの一覧を取得
   */
  getBackupList(): Array<{ filename: string; size: number; date: Date }> {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backupFiles: Array<{ filename: string; size: number; date: Date }> =
        [];

      for (const file of files) {
        if (file.startsWith('natter-backup-') && file.endsWith('.json')) {
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
      this.logger.error('Failed to get backup list:', error);
      return [];
    }
  }
}
