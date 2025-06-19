# いいね機能とバグ修正

## 概要

ソーシャルメディアの核となる「いいね」機能の実装と、発生していた増殖バグの修正記録です。

## 修正日
2025年6月19日

## 問題の症状

### いいね増殖バグ
- いいねボタンをクリックするたびにいいね数が予期しない値で増加
- ページをリロードするとカウントがリセットされる
- UI状態とバックエンドデータの整合性が取れない
- 複数回クリック時の異常な動作

## 根本原因の分析

### React State管理の問題
Post componentで`useState`の初期値をpropsに依存させていたが、propsが変更されても状態が更新されない問題:

```typescript
// 問題のあったコード
const [isLiked, setIsLiked] = useState(post.liked?.includes(currentUserId) || false);
const [likeCount, setLikeCount] = useState(post.liked?.length || 0);
```

**問題点**:
- コンポーネントの再レンダリング時に初期値が再計算されない
- propsの変更が状態に反映されない
- API呼び出し結果と表示状態の乖離

## 修正内容

### 1. 状態管理の改善

**frontend/src/components/Post/index.tsx**:
```typescript
// 修正後のコード
const [isLiked, setIsLiked] = useState(false);
const [likeCount, setLikeCount] = useState(0);
const [isLiking, setIsLiking] = useState(false);

// propsが変更されたときに状態を同期
useEffect(() => {
  setIsLiked(post.liked?.includes(currentUserId) || false);
  setLikeCount(post.liked?.length || 0);
}, [post.liked, currentUserId]);
```

**修正のポイント**:
- 初期状態を固定値に変更
- `useEffect`でpropsと状態を同期
- 依存配列でpropsの変更を適切に検知

### 2. UI構造の改善

#### Before: 問題のあった構造
```typescript
<Link href={`/post/${post?.id}`}>
  <div>
    {/* 投稿内容 */}
    <button onClick={handleLike}>❤️</button> {/* Link内のボタン */}
  </div>
</Link>
```

#### After: 修正後の構造
```typescript
<div>
  <Link href={`/post/${post?.id}`}>
    {/* 投稿内容のみ */}
  </Link>
  <div>
    <button onClick={handleLike}>❤️</button> {/* Link外のボタン */}
  </div>
</div>
```

### 3. いいね機能の完全実装

```typescript
const handleLike = async (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  
  if (isLiking) return; // 重複呼び出し防止
  
  try {
    setIsLiking(true);
    const response = await PostsApi.likePost(post.id, currentUserId);
    
    setIsLiked(response.liked);
    setLikeCount(prev => response.liked ? prev + 1 : prev - 1);
  } catch (error) {
    console.error('Failed to like post:', error);
    // エラー時は状態を元に戻す（楽観的更新の場合）
  } finally {
    setIsLiking(false);
  }
};
```

## 技術実装詳細

### 状態管理パターン

#### Local State（現在の実装）
```typescript
// 各Post componentが独自の状態を管理
const [isLiked, setIsLiked] = useState(false);
const [likeCount, setLikeCount] = useState(0);
```

**メリット**:
- シンプルな実装
- コンポーネント間の依存性なし
- 高速なレスポンス

**デメリット**:
- 状態の同期が複雑
- 他のコンポーネントへの変更通知が困難

#### Global State（将来の改善案）
```typescript
// Zustandを使ったグローバル状態管理
const useLikeStore = create((set) => ({
  likes: {},
  toggleLike: (postId, userId) => set((state) => ({
    likes: {
      ...state.likes,
      [postId]: state.likes[postId] ? null : userId
    }
  }))
}));
```

### API連携

#### エンドポイント
```
POST /posts/:id/like
```

#### リクエスト
```typescript
{
  "userId": 1,
  "key": "1234" // PASSKEY認証
}
```

#### レスポンス
```typescript
{
  "liked": true // いいね状態（true: いいね追加, false: いいね削除）
}
```

### UI フィードバック

#### アニメーション効果
```css
.like-button {
  @apply transition-colors duration-200 ease-in-out;
  
  &:hover {
    @apply text-red-500 scale-110;
  }
  
  &.liked {
    @apply text-red-500;
    animation: heartPulse 0.3s ease-in-out;
  }
}

@keyframes heartPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
```

#### 状態表示
```typescript
<button 
  onClick={handleLike}
  disabled={isLiking}
  className={`
    flex items-center gap-1 hover:text-red-500 
    transition-colors
    ${isLiked ? 'text-red-500' : 'text-gray-500'}
    ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}
  `}
>
  <IconHeart 
    size={20} 
    fill={isLiked ? 'currentColor' : 'none'}
    className="transition-all duration-200"
  />
  <span>{likeCount}</span>
</button>
```

## エラーハンドリング

### ネットワークエラー対応
```typescript
try {
  const response = await PostsApi.likePost(post.id, currentUserId);
  // 成功時の処理
} catch (error) {
  if (error.message.includes('Network')) {
    // ネットワークエラー時の処理
    setError('ネットワークエラーが発生しました');
  } else if (error.status === 401) {
    // 認証エラー時の処理
    setError('認証が必要です');
  } else {
    // その他のエラー
    setError('いいねの処理に失敗しました');
  }
}
```

### 楽観的更新（将来の改善）
```typescript
const handleLikeOptimistic = async () => {
  // 先にUIを更新
  const newLiked = !isLiked;
  const newCount = likeCount + (newLiked ? 1 : -1);
  
  setIsLiked(newLiked);
  setLikeCount(newCount);
  
  try {
    const response = await PostsApi.likePost(post.id, currentUserId);
    // API レスポンスで最終確認
    if (response.liked !== newLiked) {
      setIsLiked(response.liked);
      setLikeCount(prev => response.liked ? prev + 1 : prev - 1);
    }
  } catch (error) {
    // エラー時は元の状態に戻す
    setIsLiked(!newLiked);
    setLikeCount(likeCount);
  }
};
```

## パフォーマンス最適化

### デバウンス処理
```typescript
import { debounce } from 'lodash';

const debouncedLike = useMemo(
  () => debounce(async (postId, userId) => {
    await PostsApi.likePost(postId, userId);
  }, 300),
  []
);
```

### メモ化
```typescript
const LikeButton = memo(({ post, currentUserId }) => {
  // いいねボタンのコンポーネント実装
});

// propsが変更された時のみ再レンダリング
const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.liked === nextProps.post.liked &&
    prevProps.currentUserId === nextProps.currentUserId
  );
};

export default memo(LikeButton, areEqual);
```

## テスト方法

### 手動テスト
1. **基本動作**: いいねボタンのクリックでハートが赤くなる
2. **カウント更新**: いいね数が正確に増減する
3. **重複防止**: 連続クリック時の適切な動作
4. **状態保持**: ページリロード後の状態復元

### 自動テスト
```typescript
// Jest + React Testing Library
describe('Like functionality', () => {
  test('should toggle like state on click', async () => {
    const mockPost = { id: 1, liked: [], content: 'test' };
    render(<PostComponent post={mockPost} user={mockUser} />);
    
    const likeButton = screen.getByLabelText('いいね');
    fireEvent.click(likeButton);
    
    await waitFor(() => {
      expect(likeButton).toHaveClass('text-red-500');
    });
  });
  
  test('should prevent double clicking', async () => {
    // 連続クリックのテスト
  });
});
```

## 今後の改善点

### 1. リアルタイム更新
```typescript
// WebSocketを使ったリアルタイムいいね通知
useEffect(() => {
  const socket = io('/posts');
  
  socket.on(`post:${post.id}:like`, (data) => {
    setLikeCount(data.count);
    // 他のユーザーのいいねをリアルタイムで反映
  });
  
  return () => socket.disconnect();
}, [post.id]);
```

### 2. アニメーション強化
- いいね時のハートアニメーション
- カウンター数値の滑らかな変化
- ローディング状態の視覚的フィードバック

### 3. アクセシビリティ
- スクリーンリーダー対応
- キーボード操作対応
- 高コントラストモード対応

### 4. 分析機能
- いいね履歴の追跡
- ユーザーのいいね傾向分析
- 人気投稿の特定

## 学習ポイント

### React Patterns
1. **Props vs State**: propsの変更をstateに同期する方法
2. **useEffect Dependencies**: 依存配列の適切な設定
3. **Event Handling**: イベントの伝播制御

### UI/UX Design
1. **Feedback**: ユーザーアクションへの即座のフィードバック
2. **State Indication**: 現在の状態を明確に示すUI
3. **Error Handling**: エラー時のユーザーフレンドリーな表示

### API Design
1. **Idempotency**: 同じ操作の重複実行への対応
2. **Response Design**: 必要最小限の情報を含むレスポンス
3. **Error Codes**: 適切なHTTPステータスコードの使用

## 結論

いいね増殖バグは、React の状態管理における基本的な問題でした。propsとstateの適切な同期により解決できました。

修正後のいいね機能は以下の特徴を持ちます：
- **正確性**: バックエンドデータとUIの完全な同期
- **レスポンシブ**: 即座のユーザーフィードバック
- **堅牢性**: エラーハンドリングと重複防止
- **拡張性**: 将来の機能追加に対応した設計

この修正により、Natterアプリケーションは信頼性の高いいいね機能を提供できるようになりました。