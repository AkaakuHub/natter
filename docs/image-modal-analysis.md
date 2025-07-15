# 画像モーダル関連のコンポーネントとz-index問題調査結果

## 1. 画像モーダルのコンポーネント構造

### 主要コンポーネント
- **ImageModal**: `/Users/akaaku/dev/AkaakuHub/natter/frontend/src/components/ImageModal/index.tsx`
- **useImageModal**: `/Users/akaaku/dev/AkaakuHub/natter/frontend/src/hooks/useImageModal.ts`

### 関連コンポーネント
- **NavigationButtons**: `/Users/akaaku/dev/AkaakuHub/natter/frontend/src/components/ImageModal/components/NavigationButtons.tsx`
- **ImageDisplay**: `/Users/akaaku/dev/AkaakuHub/natter/frontend/src/components/ImageModal/components/ImageDisplay.tsx`

## 2. z-index設定の詳細

### ImageModalのz-index設定
```tsx
// ImageModal メインコンテナ
<div className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay">

// 閉じるボタン
className="absolute top-6 right-6 z-[101] text-text-inverse hover:text-text-inverse/80 bg-special-white/80 hover:bg-special-white/50 backdrop-blur-sm rounded-full p-3 transition-all duration-200"

// ナビゲーションボタン（前へ・次へ）
className="absolute left-6 top-1/2 -translate-y-1/2 z-[101] text-text-inverse hover:text-text-inverse/80 bg-overlay hover:bg-overlay/90 rounded-full p-3 transition-all duration-200"
```

### その他のモーダル系コンポーネントのz-index
- **DeleteConfirmDialog**: `z-[9999]`
- **EditPostModal**: `z-[9999]`
- **CharacterTagSelector**: `z-[9999]`
- **一般的なモーダル**: `z-50`

### ヘッダーのz-index設定
- **Header**: z-indexの明示的な設定なし（デフォルトのauto）
- **DropdownMenu**: `z-50`
- **HybridFooterMenu**: `z-50`

## 3. モーダルの位置設定

### ImageModalの位置設定
```tsx
// fixed positioning with full screen coverage
className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay"
```

### 特徴
- **position**: `fixed`（viewport基準）
- **coverage**: `inset-0`（全画面）
- **layout**: `flex items-center justify-center`（中央配置）
- **backdrop**: `bg-overlay`（半透明背景）

## 4. プロフィール画面での使用箇所

### Post コンポーネント内での使用
```tsx
// /Users/akaaku/dev/AkaakuHub/natter/frontend/src/components/Post/index.tsx
import { useImageModal } from "@/hooks/useImageModal";
const ImageModal = lazy(() => import("@/components/ImageModal"));

// 使用方法
const {
  closeImageModal,
  // ... other modal functions
} = useImageModal();

// JSX内
<ImageModal
  isOpen={isModalOpen}
  images={images}
  currentIndex={selectedImageIndex}
  onClose={closeImageModal}
/>
```

### プロフィール画面での統合
- **Profile/index.tsx**: Postコンポーネントを通じて画像モーダルを利用
- **TabsComponent**: "画像"タブ（media）で画像付き投稿を表示
- **画像クリック**: Post内の画像がクリックされた時にImageModalが開く

## 5. 潜在的なz-index問題

### 問題の特定
1. **ImageModal**: `z-[100]`
2. **他の重要なモーダル**: `z-[9999]`
3. **ヘッダー**: z-indexの明示的設定なし

### 問題の原因
- ImageModalのz-indexが他のモーダルより低い（100 vs 9999）
- ヘッダーにz-indexが設定されていないため、スタッキングコンテキストが不明確
- 複数のモーダルが同時に開く可能性がある場合の優先順位が不明確

## 6. 推奨される修正案

### z-indexの標準化
```tsx
// 推奨するz-index階層
const Z_INDEX = {
  HEADER: 40,
  DROPDOWN: 50,
  MODAL: 100,
  TOAST: 200,
  CRITICAL_MODAL: 9999
};
```

### ImageModalの修正
```tsx
// 現在: z-[100]
// 推奨: z-[9999] または統一されたz-index値
<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-overlay">
```

### ヘッダーの修正
```tsx
// Header.tsx に z-index を追加
<header className="h-[64px] border-b border-border p-4 relative flex items-center justify-between bg-surface z-40">
```

## 7. 総括

画像モーダルシステムは適切に実装されているが、z-indexの階層管理に一貫性がない。ImageModalのz-indexを他のモーダルと同等の`z-[9999]`に変更し、ヘッダーに適切なz-indexを設定することで、レイヤリング問題を解決できる。