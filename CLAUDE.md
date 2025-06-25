# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ドキュメントの保存場所
ドキュメントは `docs/` ディレクトリに保存してください。

# 重要な開発ノート
- **ポート使用**: デバッグで3000番や8000番ポートが既に使用されている場合は使用しないでください
- **フロントエンド URL**: Twitter OAuth を正常に動作させるため、 http://127.0.0.1:3000 を使用してください（localhost ではなく）
- **knip 使用**: コードを書いた後は必ず `pnpm knip` を実行して、未使用の依存関係とエクスポートを確認してください

## プロジェクト概要

Natter は Next.js フロントエンドと NestJS バックエンドを持つフルスタックソーシャルメディアアプリケーションです。pnpm ワークスペースを使用したモノレポ構造になっています。

## アーキテクチャ

### フロントエンド (Next.js + TypeScript)
- **フレームワーク**: Next.js 15 with App Router
- **認証**: NextAuth.js with Twitter OAuth
- **UI**: Tailwind CSS with shadcn/ui パターンのカスタムコンポーネント
- **状態管理**: レイアウトナビゲーション状態用の Zustand
- **モバイル UX**: モバイルファーストナビゲーションパターンのための Swiper.js

### バックエンド (NestJS + TypeScript)
- **フレームワーク**: NestJS 11.x with モジュラーアーキテクチャ
- **データベース**: SQLite with Prisma ORM
- **認証**: カスタム PASSKEY ベース認証システム
- **API**: DTO バリデーション付き RESTful エンドポイント

### 主要なアーキテクチャパターン

**フロントエンドナビゲーションシステム**: このアプリは Swiper.js と Zustand 状態管理で構築された洗練されたモバイルファーストナビゲーションを使用します。 `useLayout.tsx` ストアがナビゲーション履歴をスタックとして管理し、異なるビュー間での複雑な戻る/進む動作を可能にします。

**バックエンドモジュール構造**: 各機能領域（auth、users、server）は、controller/service/module パターンで独自の NestJS モジュールにカプセル化されています。 `PrismaService` はデータベースアクセスのためにモジュール間で注入されます。

**認証フロー**: フロントエンドは Twitter OAuth 用に NextAuth.js を使用し、バックエンドは `/check-server` エンドポイント経由の API 認証用に別の PASSKEY システムを使用します。

## よく使用するコマンド

### 開発
```bash
# フロントエンドとバックエンドの両方を実行
pnpm run dev

# フロントエンドのみ実行
pnpm run dev:frontend

# バックエンドのみ実行
cd backend && pnpm run start:dev
```

### バックエンドコマンド
```bash
# backend ディレクトリから実行
pnpm run build                    # NestJS アプリケーションをビルド
pnpm run start:dev               # ホットリロード付き開発サーバー
pnpm run lint                    # ESLint チェックと修正
pnpm run format                  # Prettier コード整形
pnpm run test                    # ユニットテスト実行
pnpm run test:watch              # ウォッチモードでテスト実行
pnpm run test:e2e               # E2E テスト実行
pnpm run test:cov               # テストカバレッジ
pnpm run test:debug             # テストデバッグ

# データベース操作
pnpm run prisma:generate        # Prisma クライアント生成
pnpm run prisma:migrate:dev     # マイグレーション作成と適用
pnpm run prisma:migrate:reset   # データベースを強制リセット
pnpm run db:push               # マイグレーションなしでスキーマ変更をプッシュ
pnpm run seed                  # テストデータでデータベースをシード
pnpm run prisma:studio         # データベースブラウザを開く
```

### フロントエンドコマンド
```bash
# frontend ディレクトリから実行
pnpm run build                  # Next.js アプリケーションをビルド
pnpm run dev                   # 開発サーバー
pnpm run lint                  # ESLint チェック
pnpm run knip                  # 未使用の依存関係/エクスポートを検索
```

## 環境設定

### バックエンド環境 (backend/ の .env)
```env
PASSKEY=keyword string
FRONTEND_URLS=http://localhost:3000,http://127.0.0.1:3000
DATABASE_URL="file:./dev.db"
```

### フロントエンド環境 (NextAuth.js)
認証が正常に動作するために Twitter OAuth 認証情報が必要です。

## データベーススキーマ

アプリケーションはシンプルな User/Post 関係を使用します：
- **User**: id、email、name、tel（オプション）
- **Post**: id、title、content、published、authorId

## フロントエンドコンポーネントアーキテクチャ

### レイアウトシステム
- `BaseLayout.tsx`: Swiper ナビゲーション付きメインレスポンシブレイアウト
- `useLayout.tsx`: ナビゲーション状態管理用 Zustand ストア
- `useNavigation.ts` & `useSwiper.ts`: ナビゲーションロジック用カスタムフック

### 主要コンポーネント
- `Profile/`: 投稿/メディア/いいねタブ付きプロフィールビュー
- `TimeLine/`: メインフィードコンポーネント
- `DetailedPost/`: 単一投稿ビュー
- `layout/hooks/`: ナビゲーションと Swiper 管理

### データフロー
フロントエンドは開発用に `src/data/mockData.ts` のモックデータを使用します。レイアウトシステムはナビゲーションスタックを維持して、異なるアプリセクション間で iOS ライクな戻るナビゲーションを可能にします。

## バックエンド API 構造

### エンドポイント
- `POST /check-server`: PASSKEY 認証
- `GET /users`: すべてのユーザーを取得
- `POST /posts`: 新しい投稿を作成
- `GET /posts`: 投稿を取得
- `GET /posts/:id`: 特定の投稿を取得
- `PATCH /posts/:id`: 投稿を更新
- `DELETE /posts/:id`: 投稿を削除

### モジュール構成
- **AuthModule**: PASSKEY 認証ガード
- **UsersModule**: Prisma 統合によるユーザー管理
- **PostsModule**: Prisma による投稿 CRUD 操作
- **ServerModule**: サーバーヘルス/認証チェック
- **PrismaModule**: データベースサービスプロバイダー

## テスト戦略

バックエンドはユニットテスト用に Jest、E2E API テスト用に Supertest を使用します。フロントエンドのテスト設定は最小限です - 複雑なナビゲーションロジックと認証フローのテストカバレッジの拡大を検討してください。

## 重要な指示リマインダー
要求されたことを実行してください。それ以上でも以下でもありません。
目標達成に絶対に必要でない限り、ファイルを作成しないでください。
新しいファイルを作成するよりも、既存のファイルを編集することを常に優先してください。
ドキュメントファイル（*.md）や README ファイルを積極的に作成しないでください。ユーザーから明示的に要求された場合のみドキュメントファイルを作成してください。