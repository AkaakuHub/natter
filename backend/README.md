# Natter Backend (NestJS)

## 概要
このプロジェクトは、NestJSフレームワークを使用したnatterのバックエンドAPIサーバーです。
元のExpressベースのバックエンドから完全移行されています。

## 技術スタック
- **フレームワーク**: NestJS 11.x
- **言語**: TypeScript
- **ORM**: Prisma
- **データベース**: SQLite
- **パッケージマネージャー**: pnpm

## プロジェクト構造
```
src/
├── app.module.ts           # メインアプリケーションモジュール
├── main.ts                 # アプリケーションブートストラップ
├── prisma/                 # データベース関連
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── auth/                   # 認証システム
│   ├── auth.guard.ts
│   └── auth.module.ts
├── server/                 # サーバーチェック機能
│   ├── server.controller.ts
│   ├── server.service.ts
│   ├── server.module.ts
│   └── dto/
│       └── check-server.dto.ts
└── users/                  # ユーザー管理
    ├── users.controller.ts
    ├── users.service.ts
    └── users.module.ts
```

## セットアップ

### 1. 依存関係のインストール
```bash
pnpm install
```

### 2. 環境変数の設定
`.env`ファイルを作成し、以下を設定：
```env
PASSKEY=your_passkey_here
FRONTEND_URLS=http://localhost:3000,http://127.0.0.1:3000
DATABASE_URL="file:./dev.db"
```

### 3. データベースの初期化
```bash
# Prismaクライアントの生成
pnpm prisma generate

# マイグレーションの実行
pnpm prisma migrate deploy

# シードデータの投入
pnpm prisma db seed
```

## 開発

### 開発サーバーの起動
```bash
pnpm run start:dev
```
サーバーは http://localhost:3001 で起動します。

### ビルド
```bash
pnpm run build
```

### 本番サーバーの起動
```bash
pnpm run start:prod
```

## API エンドポイント

### POST /check-server
サーバーの存在確認と認証
```json
{
  "key": "your_passkey"
}
```

### GET /users
全ユーザーの取得

## テスト
```bash
# ユニットテスト
pnpm run test

# E2Eテスト
pnpm run test:e2e

# テストカバレッジ
pnpm run test:cov
```

## データベース

### スキーマの更新
```bash
# マイグレーションファイルの生成
pnpm prisma migrate dev --name migration_name

# データベースのリセット
pnpm prisma migrate reset
```

### データベースの確認
```bash
# Prisma Studio の起動
pnpm prisma studio
```

## 移行履歴
- **移行日**: 2025-06-19
- **移行元**: Express.js ベースのシンプルなAPI
- **移行内容**: 完全なNestJSフレームワークへの移行
- **互換性**: 既存APIとの完全互換性を維持