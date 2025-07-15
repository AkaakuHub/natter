import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // パフォーマンス最適化
  compress: true,
  experimental: {
    optimizePackageImports: ['@tabler/icons-react'],
  },
  
  // 静的最適化とキャッシング
  generateEtags: true,
  poweredByHeader: false,
  
  images: {
    // X(Twitter)のプロフィール画像とURL メタデータ画像を表示するために追加
    remotePatterns: [
      { hostname: "pbs.twimg.com" },
      { hostname: "images.unsplash.com" },
      { hostname: "localhost" },
      { hostname: "api-demo-natter.akaaku.net" },
      // URL メタデータ用の画像ホスト (HTTPS のみ)
      { 
        protocol: "https",
        hostname: "**", // 任意のHTTPSホストを許可
      },
    ],
    // 画像最適化設定
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 外部画像の読み込みでエラーが発生した場合のフォールバック
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Webpack最適化
  webpack: (config, { dev, isServer }) => {
    // プロダクション環境での最適化
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
  
  // レスポンスヘッダー最適化
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Cache-Control',
            value: isDev 
              ? 'no-cache, no-store, must-revalidate, max-age=0'
              : 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
