import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class ImageProcessingService {
  private readonly uploadsPath = path.join(process.cwd(), 'uploads');
  private readonly processedPath = path.join(
    process.cwd(),
    'uploads',
    'processed',
  );

  constructor() {
    // processed ディレクトリが存在しない場合に作成
    void this.ensureProcessedDirectory();
  }

  private async ensureProcessedDirectory() {
    try {
      await fs.access(this.processedPath);
    } catch {
      await fs.mkdir(this.processedPath, { recursive: true });
    }
  }
  /**
   * 画像を8x8ピクセルのブロックで構成されたモザイクに変換し、ブラーをかける
   * @param originalFilename 元の画像ファイル名
   * @returns 処理済み画像のパス
   */
  async applyBlurAndMosaic(originalFilename: string): Promise<string> {
    const originalPath = path.join(this.uploadsPath, originalFilename);
    const processedFilename = `processed_${originalFilename}`;
    const processedPath = path.join(this.processedPath, processedFilename);

    try {
      // 既存の処理済みファイルがあれば削除（キャッシュクリア）
      try {
        await fs.unlink(processedPath);
      } catch {
        // ファイルが存在しない場合は無視
      }
      const image = sharp(originalPath);
      const metadata = await image.metadata();

      if (!metadata.width || !metadata.height) {
        throw new Error('画像のメタデータを読み取れませんでした。');
      }

      // --- 修正箇所 ---

      // 1. 極端に小さなサイズに縮小（強力なモザイク効果）
      const pixelatedWidth = Math.max(Math.floor(metadata.width / 32), 4);
      const pixelatedHeight = Math.max(Math.floor(metadata.height / 32), 4);

      // 2. 多段階の劣化処理で元画像を完全に認識不能にする
      const finalImageBuffer = await image
        // 第1段階: 極小サイズに縮小
        .resize(pixelatedWidth, pixelatedHeight, {
          kernel: 'nearest',
        })
        // 第2段階: 元サイズに拡大（大きなブロック生成）
        .resize(metadata.width, metadata.height, {
          kernel: 'nearest',
        })
        // 第3段階: 色相・彩度・明度を大幅に変更
        .modulate({
          brightness: 0.3, // 暗く
          saturation: 0.2, // 彩度を大幅に下げる
          hue: 90, // 色相を90度変更
        })
        // 第4段階: 強力なブラー
        .blur(15)
        // 第5段階: 色味を完全に変更
        .tint({ r: 150, g: 100, b: 200 })
        // 第6段階: さらにブラー
        .blur(8)
        // 第7段階: 最低品質で保存
        .jpeg({ quality: 20 })
        .toBuffer();

      // --- 修正ここまで ---

      await fs.writeFile(processedPath, finalImageBuffer);

      return `processed/${processedFilename}`;
    } catch (error) {
      console.error('画像処理中にエラーが発生しました:', error);
      // セキュリティ上、エラー時も元画像は絶対に返さない
      // 代わりに完全にブラックアウトした画像を生成
      try {
        const blackImageBuffer = await sharp({
          create: {
            width: 400,
            height: 400,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 1 },
          },
        })
          .png()
          .toBuffer();

        await fs.writeFile(processedPath, blackImageBuffer);
        return `processed/${processedFilename}`;
      } catch (fallbackError) {
        console.error('Failed to create fallback black image:', fallbackError);
        throw new Error('Complete image processing failure');
      }
    }
  }

  /**
   * ブラー・モザイク処理済み画像のバッファを直接返す（キャッシュなし）
   */
  async getBlurredImageBuffer(originalFilename: string): Promise<Buffer> {
    const originalPath = path.join(this.uploadsPath, originalFilename);

    try {
      const image = sharp(originalPath);
      const metadata = await image.metadata();

      if (!metadata.width || !metadata.height) {
        throw new Error('画像のメタデータを読み取れませんでした。');
      }

      // 毎回新しい処理を適用（キャッシュしない）
      const pixelatedWidth = Math.max(Math.floor(metadata.width / 32), 4);
      const pixelatedHeight = Math.max(Math.floor(metadata.height / 32), 4);

      const processedImageBuffer = await image
        // 極小サイズに縮小
        .resize(pixelatedWidth, pixelatedHeight, {
          kernel: 'nearest',
        })
        // 元サイズに拡大（大きなブロック生成）
        .resize(metadata.width, metadata.height, {
          kernel: 'nearest',
        })
        // 色相・彩度・明度を大幅に変更
        .modulate({
          brightness: 0.3,
          saturation: 0.2,
          hue: 90,
        })
        // 強力なブラー
        .blur(15)
        // 色味を完全に変更
        .tint({ r: 150, g: 100, b: 200 })
        // さらにブラー
        .blur(8)
        // 最低品質JPEG
        .jpeg({ quality: 20 })
        .toBuffer();

      return processedImageBuffer;
    } catch (error) {
      console.error('動的画像処理中にエラーが発生しました:', error);
      // エラー時は黒い画像を返す
      const blackImageBuffer = await sharp({
        create: {
          width: 400,
          height: 400,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 1 },
        },
      })
        .jpeg({ quality: 50 })
        .toBuffer();

      return blackImageBuffer;
    }
  }

  /**
   * 処理済み画像ファイルが存在するかチェック
   * @param processedFilename 処理済みファイル名
   * @returns ファイルの存在可否
   */
  async processedImageExists(processedFilename: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadsPath, processedFilename);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 処理済み画像ディレクトリをクリア
   */
  async clearProcessedImages(): Promise<void> {
    try {
      const files = await fs.readdir(this.processedPath);
      await Promise.all(
        files.map((file) => fs.unlink(path.join(this.processedPath, file))),
      );
      console.log('Processed images directory cleared');
    } catch (error) {
      console.error('Failed to clear processed images:', error);
    }
  }
}
