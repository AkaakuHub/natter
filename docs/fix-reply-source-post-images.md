# リプライ元表示で画像が表示されない問題の修正

## 問題の概要
ReplySourcePostコンポーネントでリプライ元投稿の画像が表示されていない問題が発生していました。

## 原因分析
1. **データ構造の不一致**
   - Post型では `images: string[]` で定義
   - ReplySourcePostコンポーネントでは `PostImage[]` 型（`{id: number, url: string}[]`）を期待

2. **データ受け渡しの問題**
   - DetailedPost/index.tsx で ParentPostCard に画像データが渡されていない
   - postTransformers.ts で replyTo.images が空配列に設定されている
   - ReplyModal で画像データが渡されていない

## 修正内容

### 1. postTransformers.ts の修正
```typescript
// 修正前
images: [],

// 修正後
images: post.replyTo.images || [],
```

### 2. DetailedPost/index.tsx の修正
```typescript
// ParentPostCard に画像データを追加
parentPost={{
  id: post.replyTo.id,
  content: post.replyTo.content,
  images: post.replyTo.images?.map((image, index) => ({
    id: index,
    url: image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${image}`
  })) || [],
  author: {
    name: post.replyTo.author?.name,
    image: post.replyTo.author?.image,
  },
}}

// ReplyModal に画像データを追加
replyToPost={{
  id: post.id,
  content: post.content || "",
  images: post.images || [],
  author: {
    name: post.author?.name || "Unknown User",
    image: post.author?.image,
  },
}}
```

### 3. ReplySourcePost.tsx の修正
- `string[]` と `PostImage[]` 両方の型に対応
- 画像URL変換ロジックを追加

```typescript
type ImageData = PostImage[] | string[];

// 画像データを統一形式に変換
const normalizedImages: PostImage[] = post.images
  ? post.images.map((image, index) => {
      if (typeof image === 'string') {
        return {
          id: index,
          url: image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${image}`
        };
      } else {
        return image;
      }
    })
  : [];
```

### 4. ReplyModal関連の修正
- ReplyModal/index.tsx と OriginalPost.tsx の型定義を更新
- Post/index.tsx でもReplyModalに画像データを渡すように修正

## 影響範囲
- `/Users/akaaku/dev/AkaakuHub/natter/frontend/src/utils/postTransformers.ts`
- `/Users/akaaku/dev/AkaakuHub/natter/frontend/src/components/DetailedPost/index.tsx`
- `/Users/akaaku/dev/AkaakuHub/natter/frontend/src/components/shared/ReplySourcePost.tsx`
- `/Users/akaaku/dev/AkaakuHub/natter/frontend/src/components/ReplyModal/index.tsx`
- `/Users/akaaku/dev/AkaakuHub/natter/frontend/src/components/ReplyModal/components/OriginalPost.tsx`
- `/Users/akaaku/dev/AkaakuHub/natter/frontend/src/components/Post/index.tsx`

## 検証結果
- ビルドが正常に完了
- TypeScript型エラーが解決
- 画像データの受け渡しが正しく動作するように修正

## 今後の改善点
1. 画像データの型定義を統一する検討
2. 画像URL変換ロジックを共通化する検討
3. コンポーネント間でのデータ受け渡しパターンの統一化