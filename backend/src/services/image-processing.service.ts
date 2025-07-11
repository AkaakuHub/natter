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

      // 8x8ピクセルブロックのピクセルアート処理
      const blockSize = 8;
      const newWidth = Math.ceil(metadata.width / blockSize);
      const newHeight = Math.ceil(metadata.height / blockSize);

      const finalImageBuffer = await image
        // Step 1: 8x8ブロックに縮小
        .resize(newWidth, newHeight, {
          kernel: 'nearest',
        })
        // Step 2: 元サイズに拡大してピクセルアート化
        .resize(metadata.width, metadata.height, {
          kernel: 'nearest',
        })
        .jpeg({ quality: 50 })
        .toBuffer();

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
   * 🔒 SECURITY CRITICAL: 他人からは絶対に元画像を見せない
   */
  async getBlurredImageBuffer(originalFilename: string): Promise<Buffer> {
    const originalPath = path.join(this.uploadsPath, originalFilename);

    console.log(
      `🔒 [IMAGE PROCESSING] *** MANUAL PIXEL MOSAIC for ${originalFilename} ***`,
    );

    try {
      // 元画像の存在チェック
      await fs.access(originalPath);

      const image = sharp(originalPath);
      const metadata = await image.metadata();

      if (!metadata.width || !metadata.height) {
        throw new Error('画像のメタデータを読み取れませんでした。');
      }

      console.log(
        `🔒 [IMAGE PROCESSING] Original size: ${metadata.width}x${metadata.height}`,
      );

      // 手動でピクセルモザイク処理 - 4x4ブロック分割（計16ブロック）
      const blocksPerRow = 4;
      const blocksPerCol = 4;
      const blockWidth = Math.floor(metadata.width / blocksPerRow);
      const blockHeight = Math.floor(metadata.height / blocksPerCol);

      const { data, info } = await image
        .raw()
        .toBuffer({ resolveWithObject: true });

      console.log(
        `🔒 [IMAGE PROCESSING] Processing ${info.width}x${info.height} into ${blocksPerRow}x${blocksPerCol} blocks (${blockWidth}x${blockHeight}px each)`,
      );

      // 新しい画像データを作成
      const newData = Buffer.alloc(data.length);

      // 4x4ブロック（計16ブロック）ごとに平均色を計算してモザイク処理
      for (let blockY = 0; blockY < blocksPerCol; blockY++) {
        for (let blockX = 0; blockX < blocksPerRow; blockX++) {
          // 現在のブロックの位置を計算
          const startX = blockX * blockWidth;
          const startY = blockY * blockHeight;
          const endX = Math.min(startX + blockWidth, info.width);
          const endY = Math.min(startY + blockHeight, info.height);

          // ブロック内の平均色を計算
          let totalR = 0,
            totalG = 0,
            totalB = 0;
          let pixelCount = 0;

          for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
              const pixelIndex = (y * info.width + x) * info.channels;
              totalR += data[pixelIndex];
              totalG += data[pixelIndex + 1];
              totalB += data[pixelIndex + 2];
              pixelCount++;
            }
          }

          // 平均色を計算
          const avgR = Math.floor(totalR / pixelCount);
          const avgG = Math.floor(totalG / pixelCount);
          const avgB = Math.floor(totalB / pixelCount);

          // ブロック全体を平均色で塗りつぶす
          for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
              const pixelIndex = (y * info.width + x) * info.channels;
              newData[pixelIndex] = avgR;
              newData[pixelIndex + 1] = avgG;
              newData[pixelIndex + 2] = avgB;
            }
          }
        }
      }

      // 新しい画像を作成
      const mosaicImageBuffer = await sharp(newData, {
        raw: {
          width: info.width,
          height: info.height,
          channels: info.channels,
        },
      })
        .jpeg({ quality: 80 })
        .toBuffer();

      console.log(
        `🔒 [IMAGE PROCESSING] ✅ MANUAL MOSAIC created: ${mosaicImageBuffer.length} bytes`,
      );
      return mosaicImageBuffer;
    } catch (error) {
      console.error(
        '🔒 [IMAGE PROCESSING] ❌ CRITICAL ERROR during processing:',
        error,
      );
      console.error(
        '🔒 [IMAGE PROCESSING] ❌ ERROR STACK:',
        (error as Error).stack,
      );
      // エラー時は完全に黒い画像を返す
      const blackImageBuffer = await sharp({
        create: {
          width: 400,
          height: 400,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 1 },
        },
      })
        .jpeg({ quality: 10 })
        .toBuffer();

      console.log(
        `🔒 [IMAGE PROCESSING] ❌ Returning black image (${blackImageBuffer.length} bytes)`,
      );
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
