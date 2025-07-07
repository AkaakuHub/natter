# フロントエンド・バックエンド統合修正ガイド

## 発見された問題と修正内容

### 1. リプライ作成エラーの修正

**問題**: リプライ作成時に認証トークンが送信されていない  
**修正**: `ApiClient.postFormData`を使用してAuthorizationヘッダーを含める

```typescript
// 修正前: 直接fetchを使用
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
  method: "POST",
  body: formData,
});

// 修正後: ApiClientを使用
const newReply = await ApiClient.postFormData("/posts", formData);
```

### 2. いいね機能APIの修正

**問題**: フロントエンドがuserIdを送信していたが、バックエンドはJWTから取得  
**修正**: APIコールからuserIdを削除

```typescript
// 修正前
static async likePost(postId: number, userId: string): Promise<LikeResponse> {
  return ApiClient.post<LikeResponse>(`/posts/${postId}/like`, { userId });
}

// 修正後
static async likePost(postId: number): Promise<LikeResponse> {
  return ApiClient.post<LikeResponse>(`/posts/${postId}/like`, {});
}
```

### 3. 投稿表示問題のデバッグ

**問題**: 投稿コンポーネントが表示されない  
**調査**: コンソールログを追加してデータ構造を確認

```typescript
console.log("Fetched post:", fetchedPost);
console.log("Fetched replies:", fetchedReplies);
```

### 4. 認証エラー処理の改善

**追加**: 投稿者情報がない場合のエラーハンドリング

```typescript
if (!user) {
  return <ErrorState message="投稿者の情報が見つかりません" />;
}
```

## 修正済みの主な変更点

1. **DetailedPost コンポーネント**:
   - ApiClientインポート追加
   - handleReplySubmit関数でApiClient.postFormDataを使用
   - 適切なエラーハンドリング

2. **PostsApi クラス**:
   - likePost メソッドからuserIdパラメータを削除

3. **usePostLike フック**:
   - API呼び出しからuserIdを削除

4. **型安全性の向上**:
   - Post型のオプショナルプロパティの適切な処理
   - null/undefinedチェックの追加

## 次のステップ

1. **バックエンドの動作確認**:
   - `/posts/:id` エンドポイントが適切にauthor情報を含むか確認
   - `/posts/:id/replies` エンドポイントの動作確認

2. **フロントエンドのテスト**:
   - 認証状態での投稿作成・編集・削除
   - リプライ機能のテスト
   - いいね機能のテスト

3. **エラーハンドリングの強化**:
   - 401エラー時の自動ログアウト
   - 403エラー時の適切なメッセージ表示

## 認証フローの確認

1. **ログイン**: PASSKEYとuserIdでJWTトークンを取得
2. **API呼び出し**: Authorization Bearer ヘッダーでトークンを送信
3. **バックエンド**: JWTからユーザー情報を取得して処理
4. **権限チェック**: 投稿の所有者のみ編集・削除可能