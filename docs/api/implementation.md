# API 実装記録

## 概要

Natterアプリケーションのフロントエンドで使用していたモックデータを、実際のバックエンドAPIに置き換える作業を実施しました。

## 実施日

2025年6月19日

## 実装内容

### 1. データベーススキーマの更新

既存のPrismaスキーマを拡張し、ソーシャルメディア機能をサポートするように更新しました。

#### 変更点:

**Userモデル**:
- `image` フィールドを追加（アバター画像URL）
- `createdAt` / `updatedAt` タイムスタンプを追加
- `likes` リレーションを追加

**Postモデル**:
- `title` を任意フィールドに変更
- `images` フィールドを追加（JSON文字列として画像URL配列を保存）
- `published` のデフォルト値をtrueに変更
- `createdAt` / `updatedAt` タイムスタンプを追加
- `likes` リレーションを追加

**新規Likeモデル**:
- User-Post間の多対多リレーションを管理
- ユニーク制約 `@@unique([userId, postId])` で重複いいねを防止

#### マイグレーション:
```bash
pnpm prisma migrate dev --name "add-social-media-features"
pnpm prisma db seed
```

### 2. バックエンドAPI実装

#### 投稿関連API (PostsModule)

**エンドポイント**:
- `GET /posts` - 全投稿取得（クエリパラメータ対応）
  - `?type=media` - 画像付き投稿のみ
  - `?type=liked&userId=N` - ユーザーがいいねした投稿
  - `?userId=N` - 特定ユーザーの投稿
- `GET /posts/:id` - 特定投稿取得
- `POST /posts` - 投稿作成（PASSKEY認証必須）
- `PATCH /posts/:id` - 投稿更新（PASSKEY認証必須）
- `DELETE /posts/:id` - 投稿削除（PASSKEY認証必須）
- `POST /posts/:id/like` - いいね/いいね解除（PASSKEY認証必須）
- `GET /posts/:id/likes` - 投稿のいいね情報取得

**ファイル構成**:
```
src/posts/
├── posts.controller.ts
├── posts.service.ts
├── posts.module.ts
└── dto/
    ├── create-post.dto.ts
    └── update-post.dto.ts
```

#### ユーザー関連API (UsersModule)

**追加エンドポイント**:
- `GET /users/:id` - 特定ユーザー情報取得（投稿情報含む）

### 3. フロントエンドAPI接続層

#### API クライアント実装

**ファイル構成**:
```
frontend/src/api/
├── client.ts     # 基本HTTPクライアント
├── types.ts      # TypeScript型定義
├── users.ts      # ユーザーAPI
├── posts.ts      # 投稿API
└── index.ts      # エクスポート
```

**機能**:
- 統一されたHTTPクライアント（`ApiClient`）
- TypeScript型安全性の確保
- エラーハンドリング
- PASSKEY認証のサポート

#### 主要型定義

```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { posts: number; likes: number; };
}

export interface Post {
  id: number;
  content?: string;
  images: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorId?: number;
  author?: User;
  likes?: Like[];
  _count?: { likes: number; };
}
```

### 4. フロントエンド コンポーネント更新

#### 更新したコンポーネント:

1. **TimeLine コンポーネント**
   - `PostsApi.getAllPosts()` でリアルタイムデータ取得
   - ローディング状態とエラーハンドリング実装
   - API レスポンスの型変換処理

2. **DetailedPost コンポーネント**
   - `PostsApi.getPostById()` で個別投稿取得
   - 非同期データ読み込み対応

3. **Profile コンポーネント**
   - 複数APIの並列呼び出し実装
   - タブ別データフィルタリング（投稿/メディア/いいね）
   - パフォーマンス最適化

#### 削除された依存関係:
- `frontend/src/data/mockData.ts` への依存を全て削除
- 各コンポーネントの inline mock data を削除

### 5. サンプルデータ

**seed.ts**で作成されるデータ:
- 3人のユーザー（Alice, Bob, Charlie）
- 5件の投稿（画像付きとテキストのみ）
- いくつかのいいね関係

### 6. 認証とセキュリティ

- PASSKEY環境変数による認証
- 投稿の作成・更新・削除にAuthGuard適用
- いいね機能にもPASSKEY認証必須

## 技術仕様

### 環境変数

**backend/.env**:
```env
PASSKEY=1234
FRONTEND_URLS=http://localhost:3000,http://127.0.0.1:3000
DATABASE_URL="file:./dev.db"
PORT=8000
```

**frontend/.env.local**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_PASSKEY=1234
```

### データ変換について

フロントエンドの既存コンポーネントとの互換性を保つため、API レスポンスを従来のmock data形式に変換する処理を実装しています。

## テスト方法

1. **バックエンド起動**:
   ```bash
   cd backend
   pnpm run start:dev
   ```

2. **フロントエンド起動**:
   ```bash
   cd frontend
   pnpm run dev
   ```

3. **動作確認**:
   - タイムライン表示
   - 投稿詳細表示
   - プロフィールページのタブ切り替え
   - データがリアルタイムでバックエンドから取得されることを確認

## 今後の改善点

1. **エラーハンドリングの強化**
   - ネットワークエラー時のリトライ機能
   - オフライン対応

2. **パフォーマンス最適化**
   - データキャッシュ機能
   - ページネーション実装

3. **機能拡張**
   - いいね機能のリアルタイム更新
   - 投稿作成機能のUI実装
   - 画像アップロード機能

4. **セキュリティ強化**
   - JWT認証への移行検討
   - CORS設定の最適化

## 課題と注意点

1. **データ形式の互換性**
   - 既存コンポーネントとの型整合性のため変換処理が必要
   - 将来的にはコンポーネント側の型定義統一を検討

2. **認証方式**
   - 現在は簡易PASSKEY認証
   - 本格運用時はより堅牢な認証システムが必要

3. **画像処理**
   - 現在は画像URLの文字列保存のみ
   - 実際の画像アップロード・配信機能は未実装

## 結論

モックデータから実際のバックエンドAPIへの移行が完了しました。これにより、アプリケーションは本格的なデータベース駆動のソーシャルメディア機能を提供できるようになりました。今後は上記の改善点を段階的に実装していくことで、より完成度の高いアプリケーションへと発展させることができます。