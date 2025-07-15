import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UrlMetadataResponseDto } from './dto/url-metadata.dto';
import * as cheerio from 'cheerio';

@Injectable()
export class MetadataService {
  private readonly logger = new Logger(MetadataService.name);
  private readonly CACHE_DURATION_DAYS = 7; // 1週間キャッシュ

  constructor(private prisma: PrismaService) {}

  async getUrlMetadata(url: string): Promise<UrlMetadataResponseDto> {
    try {
      // キャッシュから検索
      const cached = await this.getCachedMetadata(url);
      if (cached) {
        return cached;
      }

      // キャッシュにない場合は新規取得
      const metadata = await this.fetchMetadata(url);

      // キャッシュに保存
      await this.saveToCache(url, metadata);

      return metadata;
    } catch (error) {
      this.logger.error(`Failed to get metadata for URL: ${url}`, error);
      throw error;
    }
  }

  private async getCachedMetadata(
    url: string,
  ): Promise<UrlMetadataResponseDto | null> {
    try {
      const cached = await this.prisma.urlMetadataCache.findUnique({
        where: { url },
      });

      if (!cached) {
        return null;
      }

      // キャッシュが期限切れかチェック
      if (cached.expiresAt < new Date()) {
        // 期限切れのキャッシュを削除
        await this.prisma.urlMetadataCache.delete({
          where: { id: cached.id },
        });
        return null;
      }

      return {
        url: cached.url,
        title: cached.title || undefined,
        description: cached.description || undefined,
        image: cached.image || undefined,
        siteName: cached.siteName || undefined,
        type: cached.type || undefined,
        favicon: cached.favicon || undefined,
        cachedAt: cached.createdAt,
      };
    } catch (error) {
      this.logger.error(`Failed to get cached metadata for URL: ${url}`, error);
      return null;
    }
  }

  private async fetchMetadata(url: string): Promise<UrlMetadataResponseDto> {
    // URLの妥当性チェック
    let validUrl: URL;
    try {
      // すべての不可視文字とゼロ幅文字を除去
      const cleanUrl = url
        // ゼロ幅文字を除去
        .replace(/\u200B/g, '')
        .replace(/\u200C/g, '')
        .replace(/\u200D/g, '')
        .replace(/\u2060/g, '')
        .replace(/\uFEFF/g, '')
        // その他の不可視Unicode文字を除去
        .replace(/\u00AD/g, '')
        .replace(/\u034F/g, '')
        .replace(/\u061C/g, '')
        .replace(/\u180E/g, '')
        .replace(/\u17B4/g, '')
        .replace(/\u17B5/g, '')
        // 制御文字を除去（安全な方法）
        .split('')
        .filter((char) => {
          const code = char.charCodeAt(0);
          // 制御文字 (0x00-0x1F, 0x7F-0x9F) を除外
          return !(code <= 0x1f || (code >= 0x7f && code <= 0x9f));
        })
        .join('')
        // 余分な空白を削除
        .trim();
      // 基本的なURL形式チェック
      if (!cleanUrl || cleanUrl.length === 0) {
        throw new Error('URL is empty after cleaning');
      }

      if (!cleanUrl.match(/^https?:\/\/.+/)) {
        throw new Error(`Invalid URL format: ${cleanUrl}`);
      }

      // URLオブジェクトの作成（これが最も厳密な検証）
      validUrl = new URL(cleanUrl);

      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        throw new Error(`Invalid protocol: ${validUrl.protocol}`);
      }

      // ホスト名の妥当性チェック
      if (!validUrl.hostname || validUrl.hostname.length === 0) {
        throw new Error('Invalid or empty hostname');
      }

      if (validUrl.hostname.length > 253) {
        throw new Error(`Hostname too long: ${validUrl.hostname}`);
      }

      // 基本的なホスト名形式チェック
      if (!validUrl.hostname.includes('.')) {
        throw new Error(`Invalid hostname format: ${validUrl.hostname}`);
      }
    } catch (error) {
      this.logger.error(
        `URL validation failed for: "${url}"`,
        (error as Error).message,
      );
      if (
        error instanceof TypeError &&
        (error as Error).message.includes('Invalid URL')
      ) {
        throw new Error(`Malformed URL: ${(error as Error).message}`);
      }
      throw new Error(`Invalid URL: ${(error as Error).message}`);
    }

    try {
      // User-Agentヘッダーを設定してWebページを取得
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒でタイムアウト

      const response = await fetch(validUrl.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NatterBot/1.0)',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ja,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // メタデータを抽出
      const metadata: UrlMetadataResponseDto = {
        url: validUrl.toString(),
      };

      // Open Graph タグを優先して取得
      metadata.title =
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('title').text()?.trim() ||
        undefined;

      metadata.description =
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="twitter:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        undefined;

      metadata.image =
        $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content') ||
        $('meta[name="twitter:image:src"]').attr('content') ||
        undefined;

      metadata.siteName =
        $('meta[property="og:site_name"]').attr('content') || undefined;

      metadata.type =
        $('meta[property="og:type"]').attr('content') || undefined;

      // ファビコンを取得
      const faviconHref =
        $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr('href') ||
        $('link[rel="apple-touch-icon"]').attr('href') ||
        '/favicon.ico';

      if (faviconHref) {
        try {
          metadata.favicon = new URL(faviconHref, validUrl).toString();
        } catch {
          // ファビコンのURLが無効な場合は無視
        }
      }

      // 画像URLを絶対URLに変換
      if (metadata.image) {
        try {
          metadata.image = new URL(metadata.image, validUrl).toString();
        } catch {
          // 画像URLが無効な場合は削除
          metadata.image = undefined;
        }
      }

      // タイトルと説明文の長さ制限
      if (metadata.title && metadata.title.length > 100) {
        metadata.title = metadata.title.substring(0, 97) + '...';
      }
      if (metadata.description && metadata.description.length > 200) {
        metadata.description = metadata.description.substring(0, 197) + '...';
      }

      return metadata;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch metadata for ${validUrl.toString()}: ${(error as Error).message}`,
      );

      // 存在しないドメインやネットワークエラーの場合は、エラーではなく空のメタデータを返す
      return {
        url: validUrl.toString(),
        title: undefined,
        description: undefined,
        image: undefined,
        siteName: undefined,
        type: undefined,
        favicon: undefined,
      };
    }
  }

  private async saveToCache(
    url: string,
    metadata: UrlMetadataResponseDto,
  ): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + this.CACHE_DURATION_DAYS);

      await this.prisma.urlMetadataCache.upsert({
        where: { url },
        update: {
          title: metadata.title,
          description: metadata.description,
          image: metadata.image,
          siteName: metadata.siteName,
          type: metadata.type,
          favicon: metadata.favicon,
          updatedAt: new Date(),
          expiresAt,
        },
        create: {
          url,
          title: metadata.title,
          description: metadata.description,
          image: metadata.image,
          siteName: metadata.siteName,
          type: metadata.type,
          favicon: metadata.favicon,
          expiresAt,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to save metadata to cache for URL: ${url}`,
        error,
      );
      // キャッシュ保存に失敗してもメタデータ取得は成功扱いにする
    }
  }

  // 期限切れキャッシュのクリーンアップ（タスクスケジューラから呼び出し）
  async cleanExpiredCache(): Promise<void> {
    try {
      await this.prisma.urlMetadataCache.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
    } catch (error) {
      this.logger.error('Failed to clean expired cache:', error);
    }
  }

  // 全キャッシュのクリーンアップ（開発・デバッグ用）
  async clearAllCache(): Promise<number> {
    try {
      const result = await this.prisma.urlMetadataCache.deleteMany({});
      this.logger.log(`Cleared all ${result.count} cache entries`);
      return result.count;
    } catch (error) {
      this.logger.error('Failed to clear all cache:', error);
      throw error;
    }
  }
}
