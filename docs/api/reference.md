# API リファレンス

## ベースURL

```
http://localhost:8000
```

## 認証

保護されたエンドポイントには `key` パラメータにPASSKEYが必要です。

## エンドポイント

### ユーザー

#### GET /users
全ユーザー一覧を取得

**レスポンス**:
```json
[
  {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "image": "https://...",
    "createdAt": "2025-06-19T13:16:14.000Z",
    "updatedAt": "2025-06-19T13:16:14.000Z"
  }
]
```

#### GET /users/:id
特定ユーザーの詳細情報を取得

**レスポンス**:
```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "image": "https://...",
  "createdAt": "2025-06-19T13:16:14.000Z",
  "updatedAt": "2025-06-19T13:16:14.000Z",
  "posts": [...],
  "_count": {
    "posts": 2,
    "likes": 3
  }
}
```

### 投稿

#### GET /posts
投稿一覧を取得

**クエリパラメータ**:
- `type`: `media` (画像付き投稿のみ) または `liked` (いいねした投稿)
- `userId`: 特定ユーザーの投稿のみ取得

**レスポンス**:
```json
[
  {
    "id": 1,
    "content": "Just had an amazing breakfast! 🍳",
    "images": ["https://..."],
    "published": true,
    "createdAt": "2025-06-19T13:16:14.000Z",
    "updatedAt": "2025-06-19T13:16:14.000Z",
    "authorId": 1,
    "author": {
      "id": 1,
      "name": "Alice",
      "image": "https://..."
    },
    "likes": [...],
    "_count": {
      "likes": 2
    }
  }
]
```

#### GET /posts/:id
特定投稿の詳細を取得

#### POST /posts
新規投稿作成 (認証必須)

**リクエストボディ**:
```json
{
  "content": "投稿内容",
  "images": ["https://..."],
  "authorId": 1,
  "key": "PASSKEY"
}
```

#### PATCH /posts/:id
投稿更新 (認証必須)

**リクエストボディ**:
```json
{
  "content": "更新された投稿内容",
  "published": true,
  "key": "PASSKEY"
}
```

#### DELETE /posts/:id
投稿削除 (認証必須)

### いいね機能

#### POST /posts/:id/like
投稿にいいね/いいね解除 (認証必須)

**リクエストボディ**:
```json
{
  "userId": 1,
  "key": "PASSKEY"
}
```

**レスポンス**:
```json
{
  "liked": true
}
```

#### GET /posts/:id/likes
投稿のいいね情報取得

**レスポンス**:
```json
{
  "count": 2,
  "users": [
    {
      "id": 1,
      "name": "Alice",
      "image": "https://..."
    }
  ]
}
```

### その他

#### POST /check-server
サーバー接続確認 (認証必須)

**リクエストボディ**:
```json
{
  "key": "PASSKEY"
}
```

## エラーレスポンス

```json
{
  "statusCode": 400,
  "message": "エラーメッセージ",
  "error": "Bad Request"
}
```

## 使用例

### JavaScript/TypeScript

```typescript
// 投稿一覧取得
const posts = await fetch('http://localhost:8000/posts');
const data = await posts.json();

// いいね
const response = await fetch('http://localhost:8000/posts/1/like', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 1,
    key: process.env.PASSKEY
  })
});
```