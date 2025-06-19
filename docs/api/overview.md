# API 概要

## Natter API ドキュメント

NatterアプリケーションのバックエンドAPIに関する包括的なドキュメントです。

## API 設計原則

- **RESTful設計**: HTTPメソッドとリソースベースのURL構造
- **JSON通信**: リクエスト・レスポンスは全てJSON形式
- **PASSKEY認証**: 簡易認証システムによるAPI保護
- **エラーハンドリング**: 統一されたエラーレスポンス形式

## ベースURL

```
http://localhost:8000
```

## 認証

保護されたエンドポイントには、リクエストボディに `key` パラメータとしてPASSKEYが必要です。

```json
{
  "key": "1234",
  // ... その他のパラメータ
}
```

## レスポンス形式

### 成功レスポンス
```json
{
  // データオブジェクトまたは配列
}
```

### エラーレスポンス
```json
{
  "statusCode": 400,
  "message": "エラーメッセージ",
  "error": "Bad Request"
}
```

## データモデル

### User
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  image?: string;
  tel?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
    likes: number;
  };
}
```

### Post
```typescript
interface Post {
  id: number;
  title?: string;
  content?: string;
  images: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorId?: number;
  author?: User;
  likes?: Like[];
  _count?: {
    likes: number;
  };
}
```

### Like
```typescript
interface Like {
  id: number;
  userId: number;
  postId: number;
  createdAt: string;
  user?: User;
}
```

## エンドポイント概要

### ユーザー関連
- `GET /users` - ユーザー一覧取得
- `GET /users/:id` - 特定ユーザー取得

### 投稿関連
- `GET /posts` - 投稿一覧取得
- `GET /posts/:id` - 特定投稿取得
- `POST /posts` - 新規投稿作成 🔒
- `PATCH /posts/:id` - 投稿更新 🔒
- `DELETE /posts/:id` - 投稿削除 🔒

### いいね関連
- `POST /posts/:id/like` - いいね/いいね解除 🔒
- `GET /posts/:id/likes` - 投稿のいいね情報取得

### その他
- `POST /check-server` - サーバー接続確認 🔒

🔒 = 認証が必要なエンドポイント

## 関連ドキュメント

- [API リファレンス](./reference.md) - 詳細なAPI仕様
- [実装記録](./implementation.md) - API実装の詳細記録
- [エラーと修正](./errors-and-fixes.md) - トラブルシューティング