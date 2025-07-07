# ユーザー認証システム実装レポート

## 概要
バックエンドのユーザー認証を強化し、投稿の作成・削除・更新操作を本人のみに制限するシステムを実装しました。

## 実装内容

### 1. JWT認証システムの拡張
- `/check-server` エンドポイントにユーザー情報を含むJWTトークン生成機能を追加
- `CheckServerDto` にオプションの `userId` フィールドを追加
- JWTペイロードにユーザー情報（id, name, twitterId, image）を含めるよう拡張

### 2. 認証ガードの実装
- `JwtAuthGuard`: JWTトークンの検証
- `PostOwnerGuard`: 投稿の所有者チェック機能

### 3. エンドポイントの保護
- `POST /posts`: 投稿作成時に認証必須、投稿者をJWTから自動取得
- `PATCH /posts/:id`: 投稿更新時に認証+所有者チェック
- `DELETE /posts/:id`: 投稿削除時に認証+所有者チェック
- `POST /posts/:id/like`: いいね機能に認証追加

## セキュリティ機能

### 認証フロー
1. クライアントが `/check-server` でPASSKEYとuserIdを送信
2. サーバーがユーザー情報を含むJWTトークンを発行
3. 以降のAPIリクエストでBearerトークンとして送信
4. 各エンドポイントで認証とアクセス権限をチェック

### 所有者チェック
- 投稿の更新・削除時に `PostOwnerGuard` がDBから投稿の作成者を取得
- JWTトークンのユーザーIDと照合して本人確認
- 一致しない場合は `403 Forbidden` エラーを返却

## 技術仕様

### 新規ファイル
- `src/auth/post-owner.guard.ts`: 投稿所有者チェックガード
- `src/types/auth.types.ts`: 型定義拡張

### 変更ファイル
- `src/server/server.service.ts`: ユーザー情報を含むJWT生成
- `src/server/dto/check-server.dto.ts`: userIdフィールド追加
- `src/posts/posts.controller.ts`: 認証ガード適用
- `src/auth/auth.guard.ts`: JWTペイロード型拡張

## 使用方法

### 認証付きリクエスト例
```bash
# 1. トークン取得
curl -X POST http://localhost:8000/check-server \
  -H "Content-Type: application/json" \
  -d '{"key": "your-passkey", "userId": "user123"}'

# 2. 投稿作成（認証必須）
curl -X POST http://localhost:8000/posts \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "タイトル", "content": "内容"}'

# 3. 投稿削除（所有者のみ）
curl -X DELETE http://localhost:8000/posts/1 \
  -H "Authorization: Bearer <jwt-token>"
```

## 注意事項
- フロントエンドの対応は未実装のため、既存のフロントエンドは動作しない可能性があります
- 認証が必要なエンドポイントは必ずAuthorizationヘッダーにBearerトークンを含める必要があります
- 投稿の作成時はauthorIdはJWTから自動取得するため、リクエストボディに含める必要はありません