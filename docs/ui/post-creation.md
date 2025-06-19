# ポスト作成機能

## 概要

タイムライン上でユーザーが新しい投稿を作成できる機能です。

## 実装日
2025年6月19日

## 機能仕様

### 主要機能
- **テキスト投稿**: 280文字制限のテキスト投稿
- **画像添付**: URL入力による画像添付（複数対応）
- **リアルタイム文字数カウンター**: 残り文字数の視覚的表示
- **投稿バリデーション**: 空投稿の防止、文字数制限チェック
- **投稿後更新**: 投稿作成後のタイムライン自動リフレッシュ

### UI/UX設計

#### レイアウト
```
┌─────────────────────────────────────┐
│ [Avatar] [テキスト入力エリア]        │
│          [画像プレビューエリア]      │
│          [ツールバー] [投稿ボタン]   │
└─────────────────────────────────────┘
```

#### 状態表示
- **文字数カウンター**: 
  - 灰色: 20文字以上残り
  - オレンジ: 20文字以下
  - 赤: 文字数オーバー
- **投稿ボタン**: 状態に応じて有効/無効が切り替わる

## 実装詳細

### CreatePost コンポーネント

**ファイル**: `frontend/src/components/CreatePost/index.tsx`

#### Props
```typescript
interface CreatePostProps {
  onPostCreated?: () => void;
  currentUser?: {
    id: number;
    name: string;
    image?: string;
  };
}
```

#### State管理
```typescript
const [content, setContent] = useState("");
const [images, setImages] = useState<string[]>([]);
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);
```

#### 主要機能の実装

##### 1. 投稿送信処理
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!content.trim() && images.length === 0) {
    setError("投稿内容または画像を入力してください");
    return;
  }

  try {
    setIsSubmitting(true);
    setError(null);

    await PostsApi.createPost({
      content: content.trim(),
      images: images.length > 0 ? images : undefined,
      authorId: currentUser.id,
    });

    // 成功時の処理
    setContent("");
    setImages([]);
    onPostCreated?.();
  } catch (err) {
    setError("投稿の作成に失敗しました");
  } finally {
    setIsSubmitting(false);
  }
};
```

##### 2. 画像管理
```typescript
const handleImageAdd = () => {
  const imageUrl = prompt("画像URLを入力してください:");
  if (imageUrl && imageUrl.trim()) {
    setImages(prev => [...prev, imageUrl.trim()]);
  }
};

const handleImageRemove = (index: number) => {
  setImages(prev => prev.filter((_, i) => i !== index));
};
```

##### 3. 文字数制限
```typescript
const characterLimit = 280;
const remainingChars = characterLimit - content.length;

// 投稿ボタンの無効化条件
disabled={
  isSubmitting || 
  (!content.trim() && images.length === 0) || 
  remainingChars < 0
}
```

### TimeLine統合

#### 統合方法
```typescript
// TimeLine component内
import CreatePost from "../CreatePost";

const handlePostCreated = () => {
  // 新しい投稿が作成されたら投稿一覧を再取得
  fetchPosts();
};

return (
  <div className="w-full max-w-md mx-auto">
    {/* ポスト作成エリア */}
    <CreatePost 
      currentUser={currentUser}
      onPostCreated={handlePostCreated}
    />
    
    {/* 投稿一覧 */}
    {posts.map(post => (
      <PostComponent key={post.id} user={user} post={transformedPost} />
    ))}
  </div>
);
```

## スタイリング

### CSS クラス設計
```css
/* テキストエリア */
.post-textarea {
  @apply w-full resize-none border-none outline-none text-xl 
         placeholder-gray-500 bg-transparent;
}

/* 文字数カウンター */
.char-counter {
  @apply text-sm;
  
  /* 状態別カラー */
  &.normal { @apply text-gray-500; }
  &.warning { @apply text-orange-500; }
  &.error { @apply text-red-500; }
}

/* 投稿ボタン */
.submit-button {
  @apply px-6 py-2 rounded-full font-bold text-sm transition-colors;
  
  &.enabled { @apply bg-blue-500 text-white hover:bg-blue-600; }
  &.disabled { @apply bg-blue-300 text-white cursor-not-allowed; }
}
```

### レスポンシブ対応
- モバイルファーストデザイン
- タッチ操作に適したボタンサイズ
- 画面サイズに応じたレイアウト調整

## バリデーション

### 入力検証
1. **空投稿チェック**: テキストと画像の両方が空の場合はエラー
2. **文字数制限**: 280文字を超える場合は投稿無効
3. **ユーザー認証**: currentUserの存在確認

### エラーハンドリング
```typescript
// バリデーションエラー
if (!content.trim() && images.length === 0) {
  setError("投稿内容または画像を入力してください");
  return;
}

// API エラー
catch (err) {
  console.error("Failed to create post:", err);
  setError("投稿の作成に失敗しました");
}
```

## 画像機能

### 現在の実装（簡易版）
- URL入力による画像添付
- プレビュー表示機能
- 個別画像削除機能

### 画像プレビュー
```typescript
{images.length > 0 && (
  <div className="mt-3 grid grid-cols-2 gap-2">
    {images.map((image, index) => (
      <div key={index} className="relative">
        <Image
          src={image}
          alt={`添付画像 ${index + 1}`}
          className="w-full h-32 object-cover rounded-lg"
          width={200}
          height={128}
        />
        <button
          onClick={() => handleImageRemove(index)}
          className="absolute top-1 right-1 bg-black bg-opacity-60 
                     text-white rounded-full p-1 hover:bg-opacity-80"
        >
          <IconX size={16} />
        </button>
      </div>
    ))}
  </div>
)}
```

## 今後の改善点

### 1. ファイルアップロード機能
```typescript
// 想定される実装
const handleFileUpload = async (files: FileList) => {
  const uploadPromises = Array.from(files).map(file => 
    uploadImage(file) // S3やCloudinaryへのアップロード
  );
  
  const imageUrls = await Promise.all(uploadPromises);
  setImages(prev => [...prev, ...imageUrls]);
};
```

### 2. 下書き保存機能
```typescript
// LocalStorageを使った下書き保存
useEffect(() => {
  const draft = localStorage.getItem('post-draft');
  if (draft) {
    const { content, images } = JSON.parse(draft);
    setContent(content);
    setImages(images);
  }
}, []);

useEffect(() => {
  localStorage.setItem('post-draft', JSON.stringify({ content, images }));
}, [content, images]);
```

### 3. リッチテキスト機能
- メンション機能（@ユーザー名）
- ハッシュタグ機能（#タグ）
- 絵文字ピッカー
- リンクプレビュー

### 4. アクセシビリティ改善
- キーボードショートカット（Ctrl+Enter で投稿）
- スクリーンリーダー対応
- 高コントラストモード対応

## テスト方法

### 手動テスト
1. **基本投稿**: テキストのみの投稿が正常に作成される
2. **画像投稿**: 画像URLを追加して投稿が作成される
3. **バリデーション**: 空投稿や文字数オーバー時の適切なエラー表示
4. **自動更新**: 投稿後にタイムラインが自動で更新される

### 自動テスト（将来の実装）
```typescript
// Jest + React Testing Library
test('should create post with text content', async () => {
  render(<CreatePost currentUser={mockUser} onPostCreated={mockCallback} />);
  
  const textarea = screen.getByPlaceholderText('今何してる？');
  const submitButton = screen.getByRole('button', { name: '投稿' });
  
  fireEvent.change(textarea, { target: { value: 'テスト投稿' } });
  fireEvent.click(submitButton);
  
  await waitFor(() => {
    expect(mockCallback).toHaveBeenCalled();
  });
});
```

## パフォーマンス考慮

### 最適化ポイント
1. **画像プレビュー**: 大きな画像の遅延読み込み
2. **文字数カウンター**: デバウンス処理で頻繁な更新を制限
3. **API呼び出し**: 重複投稿の防止

### メモリ管理
```typescript
// 画像プレビューのメモリリーク防止
useEffect(() => {
  return () => {
    images.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  };
}, [images]);
```

## 結論

ポスト作成機能により、Natterアプリケーションは完全なソーシャルメディア体験を提供できるようになりました。直感的なUIと堅牢なバリデーションにより、ユーザーは簡単かつ安全に投稿を作成できます。

今後の機能拡張により、より豊富な投稿体験を提供できる基盤が整いました。