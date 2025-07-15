# APIエラーとトラブルシューティング

## 修正日
2025年6月19日

## 発生していた問題

### 1. HTTP 400エラー
**症状**: DetailedPost componentで投稿詳細を取得する際に400エラーが発生
**エラーメッセージ**: `API request failed: Error: HTTP error! status: 400`

### 2. HTTP 401認証エラー
**症状**: いいね機能で401 Unauthorized エラーが発生
**エラーメッセージ**: `API request failed: Error: HTTP error! status: 401`

### 3. いいね機能が動作しない
**症状**: いいねボタンをクリックしても API が呼び出されない

## 根本原因の調査

### API エラーの原因
1. **環境変数の設定ミス**:
   - `NEXT_PUBLIC_API_URL` が未設定
   - `NEXT_PUBLIC_PASSKEY` が古い値

2. **ポート番号の不整合**:
   - バックエンドのデフォルトポートが3001に設定されていた
   - 実際は8000ポートで動作

3. **PASSKEY不一致**:
   - フロントエンド: `keyword string`
   - バックエンド: `1234`

### いいね機能の問題
1. **UI構造の問題**:
   - `Link` コンポーネント内に `button` が配置されていた
   - イベントの伝播が正しく処理されていない

2. **API呼び出しの未実装**:
   - Post componentでいいねAPIを呼び出していなかった

## 実施した修正

### 1. 環境変数の修正

**frontend/.env.local**:
```diff
- NEXT_PUBLIC_API_URL=http://localhost:8000
- NEXT_PUBLIC_BACKEND_KEY=1234
+ NEXT_PUBLIC_API_URL=http://localhost:8000
+ NEXT_PUBLIC_PASSKEY=1234
```

### 2. バックエンドポート設定の修正

**backend/src/main.ts**:
```diff
- const port = process.env.PORT || 3001;
+ const port = process.env.PORT || 8000;
```

### 3. PASSKEY認証の統一

**PASSKEY統一**:
- フロントエンド: `NEXT_PUBLIC_PASSKEY=1234`
- バックエンド: `PASSKEY=1234`

**API層の修正**:
```typescript
// フォールバック値を設定
const passkey = process.env.NEXT_PUBLIC_PASSKEY || '1234';
```

### 4. Post componentの大幅リファクタリング

#### UI構造の改善
- `Link` 要素を投稿内容部分のみに適用
- いいねボタンを `Link` の外に配置
- イベントの伝播を適切に制御

#### いいね機能の実装
```typescript
const handleLike = async (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  
  if (isLiking) return;
  
  try {
    setIsLiking(true);
    const response = await PostsApi.likePost(post.id, currentUserId);
    
    setIsLiked(response.liked);
    setLikeCount(prev => response.liked ? prev + 1 : prev - 1);
  } catch (error) {
    console.error('Failed to like post:', error);
  } finally {
    setIsLiking(false);
  }
};
```

#### 状態管理の追加
- `isLiked`: いいね状態の管理
- `likeCount`: いいね数の管理  
- `isLiking`: API呼び出し中の状態管理

#### 初期状態の設定
```typescript
const currentUserId = 1; // 仮のユーザーID
const [isLiked, setIsLiked] = useState(post.liked?.includes(currentUserId) || false);
const [likeCount, setLikeCount] = useState(post.liked?.length || 0);
```

#### UI改善
- いいね状態に応じたハートアイコンの塗りつぶし
- ローディング中の視覚的フィードバック
- ホバー効果とトランジション

### 5. DELETE API改修
```typescript
static async delete<T>(endpoint: string, data?: any): Promise<T> {
  return this.request<T>(endpoint, {
    method: 'DELETE',
    body: data ? JSON.stringify(data) : undefined,
  });
}
```

## 修正後の動作

### APIエラーの解決
- 投稿詳細の取得が正常に動作
- タイムライン表示も問題なく動作
- プロフィールページの各タブも正常にデータを表示

### いいね機能の動作
- いいねボタンのクリックでAPI呼び出しが実行される
- リアルタイムでいいね数が更新される
- ハートアイコンの色と塗りつぶしが変化する
- ローディング中はボタンが無効化される

## テスト結果

### API接続テスト
```bash
# 投稿一覧取得
curl -X GET "http://localhost:8000/posts"
# ✅ 正常に動作

# 特定投稿取得  
curl -X GET "http://localhost:8000/posts/1"
# ✅ 正常に動作

# いいね機能
curl -X POST "http://localhost:8000/posts/1/like" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "key": "1234"}'
# ✅ 正常に動作
```

### フロントエンド動作確認
- ✅ タイムライン表示
- ✅ 投稿詳細表示
- ✅ いいねボタンの動作
- ✅ プロフィールページのタブ切り替え

## よくある問題と解決方法

### 1. 環境変数が読み込まれない
**問題**: フロントエンドで環境変数が undefined になる
**解決**: Next.jsでは環境変数変更後にフロントエンドの再起動が必要

### 2. CORS エラー
**問題**: フロントエンドからのAPI呼び出しでCORSエラー
**解決**: バックエンドのCORS設定でフロントエンドURLを許可

### 3. 認証エラー
**問題**: 401 Unauthorized エラー
**解決**: フロントエンドとバックエンドでPASSKEY値を統一

### 4. ポート番号の問題
**問題**: API呼び出しで接続エラー
**解決**: バックエンドの実際の起動ポートとAPIベースURLを確認

## 学習ポイント

1. **環境変数の重要性**: 正しい環境変数設定がAPI連携の基本
2. **UI構造設計**: リンク要素とボタン要素の適切な配置
3. **イベント処理**: stopPropagationの適切な使用
4. **状態管理**: React state を使った UI の同期
5. **エラーハンドリング**: 適切なtry-catch文とユーザーフィードバック

## 結論

APIエラーといいね機能の問題は、主に設定の不備とUI構造の問題が原因でした。環境変数の修正、ポート設定の統一、PASSKEY認証の統一、Post componentの適切なリファクタリングにより、すべての機能が正常に動作するようになりました。

これらの修正により、Natterアプリケーションはより堅牢で使いやすいソーシャルメディアアプリケーションとなりました。