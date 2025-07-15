import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MetadataService } from '../metadata/metadata.service';

@Injectable()
export class MetadataTask {
  private readonly logger = new Logger(MetadataTask.name);

  constructor(private metadataService: MetadataService) {}

  /**
   * 毎日深夜1時に期限切れキャッシュをクリーンアップ
   */
  @Cron('0 1 * * *')
  async cleanExpiredMetadataCache() {
    this.logger.log('🧹 Starting metadata cache cleanup (1:00 AM)...');
    try {
      await this.metadataService.cleanExpiredCache();
      this.logger.log('✅ Metadata cache cleanup completed successfully');
    } catch (error) {
      this.logger.error('❌ Metadata cache cleanup failed:', error);
    }
  }

  /**
   * 手動でキャッシュクリーンアップを実行
   */
  async performManualCleanup() {
    this.logger.log('🔧 Starting manual metadata cache cleanup...');
    try {
      await this.metadataService.cleanExpiredCache();
      this.logger.log(
        '✅ Manual metadata cache cleanup completed successfully',
      );
      return true;
    } catch (error) {
      this.logger.error('❌ Manual metadata cache cleanup failed:', error);
      throw error;
    }
  }
}
