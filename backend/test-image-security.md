# 画像セキュリティテスト

## セキュリティ要件

1. **同じエンドポイント**: `/posts/images/:filename`
2. **動的処理**: 認証状態によって異なる画像を返す
3. **他人からは絶対に処理済み画像のみ**: 元画像は見えない

## テスト手順

### 1. 投稿者本人のアクセス（認証済み）
```bash
# JWTトークンを使用してアクセス
curl -H "Authorization: Bearer [JWT_TOKEN]" \
     http://localhost:8000/posts/images/test-image.jpg
# 期待結果: 元画像が返される
```

### 2. 他人のアクセス（認証済み）
```bash
# 別のユーザーのJWTトークンを使用
curl -H "Authorization: Bearer [OTHER_USER_JWT_TOKEN]" \
     http://localhost:8000/posts/images/test-image.jpg
# 期待結果: 処理済み画像（モザイク・ブラー）が返される
```

### 3. 未認証のアクセス
```bash
# 認証ヘッダーなしでアクセス
curl http://localhost:8000/posts/images/test-image.jpg
# 期待結果: 処理済み画像（モザイク・ブラー）が返される
```

### 4. 公開設定の画像（認証済み）
```bash
# 公開設定された画像への他人のアクセス
curl -H "Authorization: Bearer [OTHER_USER_JWT_TOKEN]" \
     http://localhost:8000/posts/images/public-image.jpg
# 期待結果: 元画像が返される
```

## セキュリティチェックポイント

- [ ] 同じURL `/posts/images/:filename` で異なる画像が返される
- [ ] 他人からは絶対に元画像が見えない
- [ ] キャッシュが無効化されている
- [ ] エラー時は黒い画像またはアクセス拒否画像が返される
- [ ] ログが適切に出力される

## 実装の要点

1. **PostsService.getImageBuffer()**: 認証状態を判定して適切な画像バッファを返す
2. **ImageProcessingService.getBlurredImageBuffer()**: 32分割モザイク + ブラー処理
3. **PostsController.getImage()**: キャッシュ無効化 + 詳細ログ
4. **OptionalJwtAuthGuard**: 認証状態を適切に判定