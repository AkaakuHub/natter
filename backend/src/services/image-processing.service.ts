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
    // processed ディレクトリを作成
    this.ensureProcessedDirectory();
  }

  private async ensureProcessedDirectory() {
    try {
      await fs.access(this.processedPath);
    } catch {
      await fs.mkdir(this.processedPath, { recursive: true });
    }
  }

  /**
   * 画像にブラーとモザイクエフェクトを適用
   * @param originalFilename 元の画像ファイル名
   * @returns 処理済み画像のファイル名
   */
  async applyBlurAndMosaic(originalFilename: string): Promise<string> {
    const originalPath = path.join(this.uploadsPath, originalFilename);
    const processedFilename = `blurred_${originalFilename}`;
    const processedPath = path.join(this.processedPath, processedFilename);

    try {
      // 既に処理済みファイルが存在する場合は再利用
      try {
        await fs.access(processedPath);
        return `processed/${processedFilename}`;
      } catch {
        // ファイルが存在しない場合は処理を続行
      }

      // 元画像を読み込み
      const image = sharp(originalPath);
      const metadata = await image.metadata();

      // 画像を小さくリサイズしてモザイク効果を作成
      const mosaicSize =
        Math.min(metadata.width || 100, metadata.height || 100) / 20;

      const processedImage = await image
        // モザイク効果: 小さくリサイズしてから元のサイズに戻す
        .resize(Math.max(mosaicSize, 10), Math.max(mosaicSize, 10), {
          fit: 'fill',
          kernel: 'nearest', // ピクセル感を出すためにnearest neighbor
        })
        .resize(metadata.width, metadata.height, {
          fit: 'fill',
          kernel: 'nearest',
        })
        // ブラー効果を追加
        .blur(5)
        // 暗くする
        .modulate({ brightness: 0.3 })
        // JPEG形式で保存（ファイルサイズを抑える）
        .jpeg({ quality: 60 })
        .toBuffer();

      // 処理済み画像を保存
      await fs.writeFile(processedPath, processedImage);

      return `processed/${processedFilename}`;
    } catch (error) {
      console.error('Image processing failed:', error);
      // 処理に失敗した場合は元の画像を返す
      return originalFilename;
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
}
