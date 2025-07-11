import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class OgImageService {
  private readonly publicPath = path.join(process.cwd(), 'public');

  constructor() {
    void this.ensurePublicDirectory();
  }

  private async ensurePublicDirectory() {
    try {
      await fs.access(this.publicPath);
    } catch {
      await fs.mkdir(this.publicPath, { recursive: true });
    }
  }

  /**
   * トップページ用の1200x630 OG画像を生成
   */
  async generateTopPageOgImage(): Promise<string> {
    const imagePath = path.join(this.publicPath, 'og-image.png');

    try {
      // 1200x630の背景画像を作成
      const image = sharp({
        create: {
          width: 1200,
          height: 630,
          channels: 4,
          background: { r: 30, g: 30, b: 30, alpha: 1 }, // ダークテーマの背景色
        },
      });

      // SVGテキストオーバーレイを作成
      const svgOverlay = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <!-- 背景グラデーション -->
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#1e1e1e;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#2d2d2d;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="1200" height="630" fill="url(#bg)" />
          
          <!-- メインタイトル -->
          <text x="600" y="280" font-family="Arial, sans-serif" font-size="120" font-weight="bold" 
                text-anchor="middle" fill="#ffffff">Natter</text>
          
          <!-- サブタイトル -->
          <text x="600" y="360" font-family="Arial, sans-serif" font-size="48" 
                text-anchor="middle" fill="#cccccc">ソーシャルメディアプラットフォーム</text>
                
          <!-- 装飾要素 -->
          <circle cx="200" cy="150" r="30" fill="#4F46E5" opacity="0.7"/>
          <circle cx="1000" cy="480" r="40" fill="#7C3AED" opacity="0.6"/>
          <circle cx="150" cy="500" r="25" fill="#EC4899" opacity="0.8"/>
          
          <!-- ドメイン表示 -->
          <text x="600" y="520" font-family="Arial, sans-serif" font-size="32" 
                text-anchor="middle" fill="#888888">natter.akaaku.net</text>
        </svg>
      `;

      const buffer = await image
        .composite([
          {
            input: Buffer.from(svgOverlay),
            top: 0,
            left: 0,
          },
        ])
        .png()
        .toBuffer();

      await fs.writeFile(imagePath, buffer);
      return '/og-image.png';
    } catch (error) {
      console.error('Failed to generate OG image:', error);
      return '/og-image-fallback.png'; // フォールバック画像
    }
  }

  /**
   * ポスト詳細用のOG画像を生成
   */
  async generatePostOgImage(postData: {
    content: string;
    authorName: string;
    createdAt: string;
    id: number;
  }): Promise<string> {
    const imagePath = path.join(this.publicPath, `og-post-${postData.id}.png`);

    try {
      // テキストを適切な長さに切り詰め
      const truncatedContent =
        postData.content.length > 200
          ? postData.content.substring(0, 200) + '...'
          : postData.content;

      // HTMLエンティティをデコード
      const cleanContent = truncatedContent
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/');

      // 改行を適切に処理
      const wrappedContent = this.wrapText(cleanContent, 45);

      const svgOverlay = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#1e1e1e;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#2d2d2d;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="1200" height="630" fill="url(#bg)" />
          
          <!-- ヘッダー -->
          <text x="60" y="80" font-family="Arial, sans-serif" font-size="36" font-weight="bold" 
                fill="#ffffff">Natter</text>
          
          <!-- 投稿内容 -->
          ${wrappedContent
            .map(
              (line, index) =>
                `<text x="60" y="${160 + index * 40}" font-family="Arial, sans-serif" font-size="32" 
                   fill="#ffffff">${this.escapeXml(line)}</text>`,
            )
            .join('')}
          
          <!-- 投稿者情報 -->
          <text x="60" y="${Math.max(420, 200 + wrappedContent.length * 40)}" font-family="Arial, sans-serif" font-size="28" 
                fill="#cccccc">投稿者: ${this.escapeXml(postData.authorName)}</text>
          
          <!-- 日付 -->
          <text x="60" y="${Math.max(460, 240 + wrappedContent.length * 40)}" font-family="Arial, sans-serif" font-size="24" 
                fill="#888888">${new Date(postData.createdAt).toLocaleDateString('ja-JP')}</text>
                
          <!-- 装飾 -->
          <circle cx="1100" cy="100" r="20" fill="#4F46E5" opacity="0.7"/>
          <circle cx="1050" cy="550" r="25" fill="#7C3AED" opacity="0.6"/>
        </svg>
      `;

      const image = sharp({
        create: {
          width: 1200,
          height: 630,
          channels: 4,
          background: { r: 30, g: 30, b: 30, alpha: 1 },
        },
      });

      const buffer = await image
        .composite([
          {
            input: Buffer.from(svgOverlay),
            top: 0,
            left: 0,
          },
        ])
        .png()
        .toBuffer();

      await fs.writeFile(imagePath, buffer);
      return `/og-post-${postData.id}.png`;
    } catch (error) {
      console.error('Failed to generate post OG image:', error);
      return '/og-image.png'; // フォールバック
    }
  }

  /**
   * テキストを指定した文字数で改行
   */
  private wrapText(text: string, maxLength: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.slice(0, 8); // 最大8行
  }

  /**
   * XMLエスケープ
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
